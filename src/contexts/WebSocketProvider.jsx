// src/contexts/WebSocketProvider.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { API_WS_URL } from '../config/api';

// 👉 le contexte expose maintenant { lastMessage, connected, reconnect, disconnect }
const WebSocketContext = createContext({ lastMessage: null, connected: false, reconnect: () => {}, disconnect: () => {} });

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [lastMessage, setLastMessage] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  const openSocket = () => {
    // évite double open
    if (socketRef.current && [WebSocket.OPEN, WebSocket.CONNECTING].includes(socketRef.current.readyState)) {
      return;
    }
    const socket = new WebSocket(API_WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      console.log('✅ Connexion WebSocket centralisée établie !');
    };

    socket.onerror = (error) => {
      console.error('❌ Erreur WebSocket :', error);
      // on laisse onclose gérer
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

    socket.onclose = () => {
      console.log('🔌 Connexion WebSocket fermée.');
      setConnected(false);
      socketRef.current = null;
    };
  };

  const disconnect = () => {
    try {
      if (socketRef.current) {
        socketRef.current.close(4001, 'manual-disconnect');
      }
    } catch {}
    socketRef.current = null;
    setConnected(false);
  };

  const reconnect = () => {
    // ferme puis rouvre immédiatement avec le cookie courant
    disconnect();
    // petite latence pour laisser le close se propager proprement
    setTimeout(() => openSocket(), 50);
  };

  // première connexion au montage (si déjà loggé)
  useEffect(() => {
    openSocket();
    return () => {
      // en dev/StrictMode on ne ferme pas automatiquement ici
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = { lastMessage, connected, reconnect, disconnect };
  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};
