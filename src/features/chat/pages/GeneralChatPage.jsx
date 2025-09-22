import React from 'react';
import { useOutletContext } from 'react-router-dom';
import ChatRoomView from '../components/ChatRoomView';

const GeneralChatPage = () => {
  const outletContext = useOutletContext() || {};
  const rooms = outletContext.rooms || {};
  const general = rooms.general || {
    label: 'Chat général',
    description: 'Discutez avec l’ensemble de la communauté.',
  };

  return (
    <ChatRoomView
      roomId="general"
      domain="general"
      title={general.label || 'Chat général'}
      description={general.description || 'Discutez avec l’ensemble de la communauté.'}
      allowAreaSelection={false}
      showActiveUsers
      variant="full"
    />
  );
};

export default GeneralChatPage;
