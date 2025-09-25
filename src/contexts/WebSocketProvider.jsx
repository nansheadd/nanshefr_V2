// src/contexts/WebSocketProvider.jsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { buildApiWsUrl } from '../config/api';
import { getStoredAccessToken } from '../utils/authTokens';

// 👉 le contexte expose maintenant { lastMessage, connected, reconnect, disconnect }
const WebSocketContext = createContext({ lastMessage: null, connected: false, reconnect: () => {}, disconnect: () => {} });

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [lastMessage, setLastMessage] = useState(null);
  const [connected, setConnected] = useState(false);
  const [shouldConnect, setShouldConnect] = useState(false);
  const socketRef = useRef(null);
  const shouldConnectRef = useRef(false);

  const openSocket = useCallback(() => {
    if (!shouldConnectRef.current) {
      console.debug('[WebSocket] Connexion non tentée : accès désactivé.');
      return;
    }

    if (typeof window === 'undefined' || typeof window.WebSocket === 'undefined') {
      console.warn('[WebSocket] Environnement sans support WebSocket — connexion annulée.');
      return;
    }

    if (
      socketRef.current &&
      [window.WebSocket.OPEN, window.WebSocket.CONNECTING].includes(socketRef.current.readyState)
    ) {
      return;
    }

    try {
      const socketUrl = buildApiWsUrl();
      const socket = new window.WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setConnected(true);
        console.log('✅ Connexion WebSocket centralisée établie !');
      };

      socket.onerror = (error) => {
        console.error('❌ Erreur WebSocket :', error);
      };

      socket.onmessage = (event) => {
        console.log('WS raw:', event.data); // debug
        try {
          const data = JSON.parse(event.data);
          setLastMessage({ ...data, id: Date.now() });
        } catch {
          // non JSON → ignore
        }
      };

      socket.onclose = (event) => {
        console.log('🔌 Connexion WebSocket fermée.', event);
        setConnected(false);
        socketRef.current = null;

        const isManualClose = [4000, 4001, 4002].includes(event?.code);
        if (!isManualClose && shouldConnectRef.current) {
          // tentative de reconnexion automatique si l'accès est toujours autorisé
          setTimeout(() => {
            openSocket();
          }, 2000);
        }
      };
    } catch (error) {
      console.error('[WebSocket] Impossible d’ouvrir la connexion.', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    shouldConnectRef.current = false;
    setShouldConnect(false);

    const socket = socketRef.current;
    if (socket) {
      try {
        socket.close(4001, 'manual-disconnect');
      } catch (error) {
        console.warn('[WebSocket] Erreur lors de la fermeture manuelle.', error);
      }
    }

    socketRef.current = null;
    setConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    shouldConnectRef.current = true;
    setShouldConnect(true);

    setTimeout(() => {
      const socket = socketRef.current;
      if (socket) {
        try {
          socket.close(4002, 'manual-reconnect');
        } catch (error) {
          console.warn('[WebSocket] Erreur lors de la fermeture pour reconnexion.', error);
        }
      } else {
        openSocket();
      }
    }, 50);
  }, [openSocket]);

  useEffect(() => {
    shouldConnectRef.current = shouldConnect;

    if (!shouldConnect) {
      const socket = socketRef.current;
      if (socket) {
        try {
          socket.close(4000, 'auto-disabled');
        } catch (error) {
          console.warn('[WebSocket] Erreur lors de la fermeture automatique.', error);
        }
      }
      return;
    }

    openSocket();
  }, [shouldConnect, openSocket]);

  useEffect(() => {
    return () => {
      shouldConnectRef.current = false;
      const socket = socketRef.current;
      if (socket) {
        try {
          socket.close(4000, 'provider-unmount');
        } catch (error) {
          console.warn('[WebSocket] Erreur lors de la fermeture en démontage.', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (token) {
      shouldConnectRef.current = true;
      setShouldConnect(true);
    }
  }, []);

  const value = useMemo(
    () => ({ lastMessage, connected, reconnect, disconnect }),
    [lastMessage, connected, reconnect, disconnect]
  );

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};
