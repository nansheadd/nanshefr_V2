import React, { useMemo } from 'react';
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import ChatRoomView from '../components/ChatRoomView';

const formatDomainLabel = (value) => {
  if (!value) return 'Salon de discussion';
  const normalized = value.replace(/[-_]/g, ' ');
  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const DomainChatPage = () => {
  const { domainId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const outletContext = useOutletContext() || {};
  const rooms = outletContext.rooms || {};

  const decodedDomain = useMemo(() => {
    try {
      return decodeURIComponent(domainId || '');
    } catch (error) {
      console.warn('Unable to decode domain identifier', error);
      return domainId || '';
    }
  }, [domainId]);

  const domainRoom = useMemo(() => {
    if (!Array.isArray(rooms?.domains)) return null;
    return (
      rooms.domains.find((room) => {
        const key = room.slug || room.domain || room.id;
        return key === decodedDomain;
      }) || null
    );
  }, [decodedDomain, rooms?.domains]);

  const initialArea = searchParams.get('area') || domainRoom?.areas?.[0] || '';

  const handleFilterChange = (nextValue) => {
    const params = new URLSearchParams(searchParams);
    if (nextValue) {
      params.set('area', nextValue);
    } else {
      params.delete('area');
    }
    setSearchParams(params, { replace: true });
  };

  const roomKey = domainRoom?.domain || domainRoom?.slug || decodedDomain;

  return (
    <ChatRoomView
      roomId={`domain:${roomKey}`}
      domain={roomKey}
      title={domainRoom?.label || formatDomainLabel(decodedDomain)}
      description={domainRoom?.description || 'Échangez avec les apprenants de ce domaine.'}
      defaultArea={domainRoom?.areas?.includes(initialArea) ? initialArea : domainRoom?.areas?.[0]}
      initialAreaFilter={initialArea}
      onAreaFilterChange={handleFilterChange}
      availableAreas={domainRoom?.areas || []}
      allowAreaSelection
      showActiveUsers
      variant="full"
    />
  );
};

export default DomainChatPage;
