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
        console.log('🔌 Attempting to connect to SSE stream at:', sseUrl);
        eventSource = new EventSource(sseUrl);

        // Handle connection opened
        eventSource.addEventListener('open', () => {
          console.log('✅ Connected to waybill SSE stream');
          reconnectAttempts = 0;
        });

        // Handle incoming messages
        eventSource.addEventListener('message', (event) => {
          try {
            console.log('📨 Raw SSE message received:', event.data);
            const message = JSON.parse(event.data);
            console.log('✨ Parsed message:', message);

            if (message.type === 'waybill_updated') {
              console.log(
                `📡 SSE: Waybill update received - ${message.message}`,
                message
              );

              // Invalidate query to trigger refetch
              // This causes React Query to refetch the waybill list
              console.log('🔄 Invalidating React Query cache for waybills...');
              queryClient.invalidateQueries({
                queryKey: [WAYBILL_QUERY_KEYS.waybills],
              });
              console.log('✅ Cache invalidated, data should refetch now');

              // Reset reconnect counter on successful message
              reconnectAttempts = 0;
            }
          } catch (error) {
            console.error('Failed to parse SSE message:', error);
          }
        });

        // Handle connection errors
        eventSource.addEventListener('error', (error) => {
          console.warn('⚠️ SSE connection error:', error);

          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          // Attempt to reconnect with exponential backoff
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 10000);
            console.log(
              `🔄 Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts}) in ${backoffDelay}ms...`
            );
            setTimeout(() => {
              connect();
            }, backoffDelay);
          } else {
            console.error(
              '❌ Max reconnect attempts reached. SSE connection failed permanently.'
            );
          }
        });

        console.log('✅ Connected to waybill SSE stream');
      } catch (error) {
        console.error('Failed to create EventSource:', error);
      }
    };

    // Establish initial connection
    connect();

    // Cleanup on component unmount
    return () => {
      if (eventSource) {
        eventSource.close();
        console.log('✅ Disconnected from waybill SSE stream');
      }
    };
  }, [queryClient]);
};

export default useWaybillStream;

