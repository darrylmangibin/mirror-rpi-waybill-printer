import { useState, useEffect } from 'react';

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
        // Call backend API (assumes it runs on localhost:5000)
        const response = await fetch(`http://localhost:5000${endpoint}`);
        
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
