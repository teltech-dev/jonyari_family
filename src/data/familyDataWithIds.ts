'use client';

import { useState, useEffect } from 'react';
import { FamilyData } from '../types/family';

// Default empty data structure
const defaultFamilyData: FamilyData = {
  generations: []
};

// Hook to fetch family data on the client
export function useFamilyData(): { 
  data: FamilyData; 
  loading: boolean; 
  error: string | null 
} {
  const [data, setData] = useState<FamilyData>(defaultFamilyData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch data from API endpoint
        const response = await fetch('/api/family-data');
        
        if (!response.ok) {
          throw new Error(`API returned error status: ${response.status}`);
        }
        
        const fetchedData = await response.json();
        setData(fetchedData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch family data:', err);
        setError('Failed to load family data, using default data');
        // Use default data on error
        setData(defaultFamilyData);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}

// Export default data for convenience when needed
export const familyDataWithIds = defaultFamilyData; 