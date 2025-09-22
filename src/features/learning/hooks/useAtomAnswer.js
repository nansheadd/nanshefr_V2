import { useCallback, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';

const invalidateLearningCaches = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['capsule'], exact: false });
  queryClient.invalidateQueries({ queryKey: ['learningSession'], exact: false });
  queryClient.invalidateQueries({ queryKey: ['atoms'], exact: false });
};

export const useAtomAnswer = ({ atom, onReward, onResult, onReset }) => {
  const queryClient = useQueryClient();
  const completed = atom?.progress_status === 'completed';
  const rewardRef = useRef(completed);

  useEffect(() => {
    rewardRef.current = atom?.progress_status === 'completed';
  }, [atom?.progress_status]);

  const logAnswerMutation = useMutation({
    mutationFn: (payload) => apiClient.post('/progress/log-answer', payload).then((res) => res.data),
    onSuccess: (data) => {
      invalidateLearningCaches(queryClient);
      if (data?.is_correct && !rewardRef.current) {
        onReward?.({ xp: data?.xp_awarded });
        rewardRef.current = true;
      }
      onResult?.(data ?? null);
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => apiClient.post(`/progress/atom/${atom?.id}/reset`).then((res) => res.data),
    onSuccess: () => {
      invalidateLearningCaches(queryClient);
      rewardRef.current = false;
      onReset?.();
    },
  });

  const submitAnswer = useCallback((isCorrect, answerPayload = {}) => {
    if (!atom?.id) return;
    logAnswerMutation.mutate({
      atom_id: atom.id,
      is_correct: Boolean(isCorrect),
      answer: answerPayload,
    });
  }, [atom?.id, logAnswerMutation]);

  const resetProgress = useCallback(() => {
    if (!atom?.id) return;
    resetMutation.mutate();
  }, [atom?.id, resetMutation]);

  const isLoading = logAnswerMutation.isPending || resetMutation.isPending;

  return {
    submitAnswer,
    resetProgress,
    logAnswerMutation,
    resetMutation,
    isLoading,
    rewardAlreadyGranted: rewardRef.current,
  };
};

export default useAtomAnswer;
