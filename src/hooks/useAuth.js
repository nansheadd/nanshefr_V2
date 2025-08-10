// Fichier: src/hooks/useAuth.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosConfig';

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
  
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    staleTime: Infinity,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
    },
  });
  
  const registerAndLogin = async (userData) => {
    await registerMutation.mutateAsync(userData);
    await loginMutation.mutateAsync({ username: userData.username, password: userData.password });
  }

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    isError,
    login: loginMutation.mutateAsync,
    registerAndLogin: registerAndLogin,
    logout: logoutMutation.mutate,
  };
};