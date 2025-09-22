import { useQuery } from '@tanstack/react-query';
import { fetchChatRooms } from '../api/chatApi';

export const useChatRoomsQuery = () =>
  useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: fetchChatRooms,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

export default useChatRoomsQuery;
