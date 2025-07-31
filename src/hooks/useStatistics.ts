// hooks/useStatistics.ts
import { useState, useEffect } from 'react';
import { StatisticsData, fetchStatistics } from '@/API/Statistics';

export const useStatistics = (): {
  statistics: StatisticsData | null;
  loading: boolean;
  error: string | null;
} => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getStatistics = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('No authentication token found');
        
        const data = await fetchStatistics(token);
        setStatistics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    getStatistics();
  }, []);

  return { statistics, loading, error };
};