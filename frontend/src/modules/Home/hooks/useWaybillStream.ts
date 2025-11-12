import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WAYBILL_QUERY_KEYS } from '@/modules/Home/constants';
import { API_BASE_URL } from '@/config';

/**
 * Hook to establish Server-Sent Events (SSE) connection for real-time waybill updates.
 * 
 * This hook:
 * - Establishes a persistent SSE connection to the backend
 * - Listens for waybill update events
 * - Automatically invalidates React Query cache when updates occur
 * - Handles connection errors and automatic reconnection
 * - Cleans up connections on unmount
 * 
 * Usage:
 * ```tsx
 * const Home = () => {
 *   useWaybillStream();
 *   // ... rest of component
 * }
 * ```
 */
export const useWaybillStream = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const connect = () => {
      try {
        // Establish SSE connection using full URL (important for IP-based access)
        const sseUrl = `${API_BASE_URL}/api/waybills/prints/stream`;
        eventSource = new EventSource(sseUrl);

        // Handle connection opened
        eventSource.addEventListener('open', () => {
          console.log('✅ SSE Connected');
          reconnectAttempts = 0;
        });

        // Handle incoming messages
        eventSource.addEventListener('message', (event) => {
          try {
            const message = JSON.parse(event.data);

            if (message.type === 'waybill_updated') {
              // Invalidate query to trigger refetch
              queryClient.invalidateQueries({
                queryKey: [WAYBILL_QUERY_KEYS.waybills],
              });
              
              // Force immediate refetch
              queryClient.refetchQueries({
                queryKey: [WAYBILL_QUERY_KEYS.waybills],
              });

              // Reset reconnect counter on successful message
              reconnectAttempts = 0;
            }
          } catch (error) {
            console.error('SSE parse error:', error);
          }
        });

        // Handle connection errors
        eventSource.addEventListener('error', () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          // Attempt to reconnect with exponential backoff
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 10000);
            console.log(`⚠️ SSE reconnecting (${reconnectAttempts}/${maxReconnectAttempts})...`);
            setTimeout(() => {
              connect();
            }, backoffDelay);
          } else {
            console.error('❌ SSE connection failed permanently');
          }
        });
      } catch (error) {
        console.error('SSE error:', error);
      }
    };

    // Establish initial connection
    connect();

    // Cleanup on component unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [queryClient]);
};

export default useWaybillStream;

