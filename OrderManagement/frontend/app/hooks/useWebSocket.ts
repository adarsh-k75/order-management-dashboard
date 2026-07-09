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
    let localWs: WebSocket | null = null;
    let isCleanedUp = false;

    const connect = () => {
      if (isCleanedUp) return;

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
      console.log(`Connecting to WebSocket: ${wsUrl}`);
      
      try {
        const ws = new WebSocket(wsUrl);
        localWs = ws;
        wsRef.current = ws;

        ws.onopen = () => {
          if (isCleanedUp) {
            ws.close();
            return;
          }
          setConnected(true);
          console.log('WebSocket connection established.');
        };

        ws.onmessage = (event) => {
          if (isCleanedUp) return;
          try {
            const parsed = JSON.parse(event.data);
            callbackRef.current(parsed);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onclose = () => {
          setConnected(false);
          if (isCleanedUp) return;
          console.log('WebSocket connection closed. Retrying connection in 3 seconds...');
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = (error) => {
          if (isCleanedUp) return;
          console.error('WebSocket connection error:', error);
          ws.close();
        };
      } catch (err) {
        console.error('Failed to instantiate WebSocket:', err);
        if (!isCleanedUp) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      }
    };

    connect();

    // Clean up websocket instance on component unmount
    return () => {
      isCleanedUp = true;
      if (localWs) {
        localWs.onclose = null; // Disable reconnect trigger on manual close
        localWs.onerror = null;
        localWs.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  return connected;
};
