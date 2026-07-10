import { useEffect, useRef, useState } from 'react';

/**
 * Custom React Hook to connect to a WebSocket server for real-time order updates.
 * @param {Function} onMessage - Callback function to run when a message is received from the server.
 * @returns {boolean} - The current connection state (true if connected, false if disconnected).
 */
export const useWebSocket = (onMessage) => {
  // 1. Keep track of the connection state (true or false)
  const [connected, setConnected] = useState(false);
  
  // 2. Ref to store the WebSocket instance so it persists across renders
  const wsRef = useRef(null);
  
  // 3. Ref to store the callback function.
  // We do this so if onMessage changes, we don't trigger the WebSocket reconnection.
  const callbackRef = useRef(onMessage);

  // Keep the latest callback reference updated
  useEffect(() => {
    callbackRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    let reconnectTimeout;
    let localWs = null;
    let isCleanedUp = false; // Flag to prevent connection attempts after component unmount

    // Inner helper function to establish a connection
    const connect = () => {
      if (isCleanedUp) return;

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
      console.log(`Connecting to WebSocket: ${wsUrl}`);
      
      try {
        const ws = new WebSocket(wsUrl);
        localWs = ws;
        wsRef.current = ws;

        // Triggered when connection is established
        ws.onopen = () => {
          if (isCleanedUp) {
            ws.close();
            return;
          }
          setConnected(true);
          console.log('WebSocket connection established.');
        };

        // Triggered when a new message is received
        ws.onmessage = (event) => {
          if (isCleanedUp) return;
          try {
            const parsed = JSON.parse(event.data);
            // Execute the callback function using the cached callback reference
            callbackRef.current(parsed);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        // Triggered when the server closes the connection
        ws.onclose = () => {
          setConnected(false);
          if (isCleanedUp) return;
          console.log('WebSocket connection closed. Retrying connection in 3 seconds...');
          
          // Retry connecting after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000);
        };

        // Triggered when a connection error occurs
        ws.onerror = (error) => {
          if (isCleanedUp) return;
          console.error('WebSocket connection error:', error);
          ws.close(); // Closing triggers the onclose/reconnect cycle
        };
      } catch (err) {
        console.error('Failed to instantiate WebSocket:', err);
        if (!isCleanedUp) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      }
    };

    connect(); // Initiate the first connection

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
  }, []); // Run only once when the component mounts

  return connected;
};
