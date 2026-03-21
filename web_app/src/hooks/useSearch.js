import { useState } from 'react';
import { searchMedicine } from '../api/genora';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAlt, setSelectedAlt] = useState(null);

  const search = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setQuery(searchQuery);
    setSelectedAlt(null);
    setResults(null);

    try {
      const data = await searchMedicine(searchQuery);
      setResults(data);
    } catch {
      setError('Failed to fetch results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectAlt = (alt) => {
    setSelectedAlt(alt);
  };

  return {
    query,
    results,
    loading,
    error,
    selectedAlt,
    search,
    selectAlt,
    setQuery
  };
};
