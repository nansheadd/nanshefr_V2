// Fichier: src/hooks/useAuth.js
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosConfig';
import { useWebSocket } from '../contexts/WebSocketProvider';
import { clearStoredAccessToken, setStoredAccessToken } from '../utils/authTokens';
import {
  clearStoredUserProfile,
  getStoredUserProfile,
  setStoredUserProfile,
} from '../utils/userProfileStorage';

const fetchUser = async () => {
  try {
    const { data } = await apiClient.get('/users/me');
    if (data) {
      setStoredUserProfile(data);
    } else {
      clearStoredUserProfile();
    }
    return data;
  } catch (error) {
    if (error?.response?.status === 401) {
      clearStoredUserProfile();
      return null;
    }

    const cached = getStoredUserProfile();
    if (cached) {
      return cached;
    }

    return null;
  }
};

const TOKEN_KEYS = ['access_token', 'accessToken', 'token', 'access'];

const normalizeTokenString = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const resolveAccessToken = (input, visited = new Set(), allowLooseString = true) => {
  if (typeof input === 'string') {
    return allowLooseString ? normalizeTokenString(input) : null;
  }

  if (!input) {
    return null;
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      const nested = resolveAccessToken(item, visited, allowLooseString);
      if (nested) {
        return nested;
      }
    }
    return null;
  }

  if (typeof input !== 'object') {
    return null;
  }

  if (visited.has(input)) {
    return null;
  }
  visited.add(input);

  for (const key of TOKEN_KEYS) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      const nested = resolveAccessToken(input[key], visited, true);
      if (nested) {
        return nested;
      }
    }
  }

  for (const value of Object.values(input)) {
    if (value && typeof value === 'object') {
      const nested = resolveAccessToken(value, visited, false);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
};

const loginUser = async (credentials) => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);
  clearStoredAccessToken();
  const { data } = await apiClient.post('/users/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const directToken = typeof data === 'object' && data !== null ? data.access_token : null;
  const accessToken = resolveAccessToken(directToken ?? data);

  if (typeof window !== 'undefined') {
    console.debug('[Auth] Login response evaluated for token.', {
      payloadType: data === null ? null : typeof data,
      payloadKeys: data && typeof data === 'object' ? Object.keys(data) : null,
      hasDirectAccessToken: typeof directToken === 'string' && directToken.trim().length > 0,
      resolvedTokenLength: typeof accessToken === 'string' ? accessToken.length : null,
    });
  }

  if (typeof accessToken === 'string' && accessToken.trim()) {
    setStoredAccessToken(accessToken);
  } else {
    console.warn('[Auth] Login succeeded but no access token was found in response payload.', {
      payloadKeys: data && typeof data === 'object' ? Object.keys(data) : null,
    });
  }
  return data;
};

const registerUser = async (userData = {}) => {
  const payload = { ...userData };

  if (typeof payload.username === 'string') {
    payload.username = payload.username.trim();
  }

  if (typeof payload.email === 'string') {
    payload.email = payload.email.trim();
  }

  if (payload.passwordConfirm !== undefined) {
    payload.password_confirm = payload.passwordConfirm;
    delete payload.passwordConfirm;
  }

  if (payload.password_confirmation !== undefined) {
    payload.password_confirm = payload.password_confirmation;
    delete payload.password_confirmation;
  }

  if (payload.password_confirm === undefined && payload.password !== undefined) {
    payload.password_confirm = payload.password;
  }

  const { data } = await apiClient.post('/users/', payload);
  return data;
};

const logoutUser = async () => {
  const { data } = await apiClient.post('/users/logout');
  clearStoredAccessToken();
  return data;
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { reconnect, disconnect } = useWebSocket();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    staleTime: Infinity,
    retry: false,
    initialData: () => getStoredUserProfile(),
  });

  useEffect(() => {
    if (user) {
      setStoredUserProfile(user);
    } else if (!isLoading) {
      clearStoredUserProfile();
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (user) {
      reconnect();
    } else {
      disconnect();
    }
  }, [user, isLoading, reconnect, disconnect]);

  // Après login: invalidation + refetch de l'utilisateur, puis reconnect WS
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      await queryClient.refetchQueries({ queryKey: ['user'] });
      // le cookie access_token est posé par /users/login → on reconnecte la WS avec ce cookie
      reconnect();
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
  });

  // Après logout: on efface le cache user et on déconnecte la WS
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      clearStoredUserProfile();
      disconnect();
    },
  });

  // helper: inscription puis login, puis reconnect WS
  const registerAndLogin = async (userData) => {
    await registerMutation.mutateAsync(userData);
    await loginMutation.mutateAsync({
      username: userData.username,
      password: userData.password,
    });
    // onSuccess du loginMutation fera déjà le reconnect,
    // mais on peut forcer un ensure pour être sûr que le user est bien rafraîchi si besoin :
    // await queryClient.ensureQueryData({ queryKey: ['user'], queryFn: fetchUser });
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    isError,
    login: loginMutation.mutateAsync,
    registerAndLogin,
    logout: logoutMutation.mutate,
  };
};
