import { useState, useEffect } from 'react';
import { config } from './config';

interface ApiResponse {
  message: string;
  status: string;
}

interface UseApiState {
  data: ApiResponse | null;
  loading: boolean;
  error: string | null;
}

export function useApi(endpoint: string) {
  const [state, setState] = useState<UseApiState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Call backend API using configured base URL
        const url = `${config.apiBaseUrl}${endpoint}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    fetchData();
  }, [endpoint]);

  return state;
}
