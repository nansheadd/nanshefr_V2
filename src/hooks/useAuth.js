// src/hooks/useAuth.js
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

// Charge l'utilisateur courant via cookie HttpOnly (ou header si fallback localStorage)
const fetchUser = async () => {
  try {
    const { data } = await apiClient.get('/users/me');
    if (data) setStoredUserProfile(data);
    else clearStoredUserProfile();
    return data;
  } catch (error) {
    if (error?.response?.status === 401) {
      clearStoredUserProfile();
      return null;
    }
    const cached = getStoredUserProfile();
    return cached || null;
  }
};

// Login: envoie form-urlencoded, garde access_token du body en fallback localStorage si présent
const loginUser = async ({ username, password, rememberMe = false }) => {
  clearStoredAccessToken(); // reset du fallback avant login
  const form = new URLSearchParams();
  form.set('username', String(username ?? ''));
  form.set('password', String(password ?? ''));

  const { data } = await apiClient.post('/users/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (rememberMe) {
    if (data && typeof data.access_token === 'string' && data.access_token.trim()) {
      setStoredAccessToken(data.access_token);
    } else {
      console.warn('[Auth] Login succeeded but no access_token in response body (cookie-only auth).');
    }
  } else {
    console.info('[Auth] Login succeeded without remember-me fallback.');
  }
  return data;
};

const registerUser = async (userData = {}) => {
  const payload = { ...userData };
  if (typeof payload.username === 'string') payload.username = payload.username.trim();
  if (typeof payload.email === 'string') payload.email = payload.email.trim();

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
  clearStoredAccessToken(); // supprime le fallback
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
    if (user) setStoredUserProfile(user);
    else if (!isLoading) clearStoredUserProfile();
  }, [user, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    if (user) reconnect();
    else disconnect();
  }, [user, isLoading, reconnect, disconnect]);

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async () => {
      // Après login: on relit /users/me (le cookie HttpOnly sera désormais envoyé)
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      await queryClient.refetchQueries({ queryKey: ['user'] });
      reconnect();
    },
  });

  const registerMutation = useMutation({ mutationFn: registerUser });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      clearStoredUserProfile();
      disconnect();
    },
  });

  const registerAndLogin = async (userData) => {
    await registerMutation.mutateAsync(userData);
    await loginMutation.mutateAsync({
      username: userData.username,
      password: userData.password,
      rememberMe: true,
    });
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
