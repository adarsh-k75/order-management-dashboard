import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (onMessage: (data: { event: string; data: any }) => void) => {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const callbackRef = useRef(onMessage);

  // Keep the latest callback reference updated without triggering re-initialization of WebSocket
  useEffect(() => {
    callbackRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    let reconnectTimeout: any;

    const connect = () => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
      console.log(`Connecting to WebSocket: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log('WebSocket connection established.');
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          callbackRef.current(parsed);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        console.log('WebSocket connection closed. Retrying connection in 3 seconds...');
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket connection error:', error);
        ws.close();
      };
    };

    connect();

    // Clean up websocket instance on component unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // Disable reconnect trigger on manual close
        wsRef.current.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  return connected;
};
