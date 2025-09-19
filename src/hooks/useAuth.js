// Fichier: src/hooks/useAuth.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosConfig';
import { useWebSocket } from '../contexts/WebSocketProvider';

const fetchUser = async () => {
  try {
    const { data } = await apiClient.get('/users/me');
    return data;
  } catch {
    return null;
  }
};

const loginUser = async (credentials) => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);
  const { data } = await apiClient.post('/users/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return data;
};

const registerUser = async (userData) => {
  const { data } = await apiClient.post('/users/', userData);
  return data;
};

const logoutUser = async () => {
  const { data } = await apiClient.post('/users/logout');
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
  });

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
