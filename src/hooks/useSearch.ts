import { useState, useMemo, useEffect } from 'react';
import type { Tool, FilterOptions } from '@/types';
import { filterTools } from '@/utils/searchFilter';
import { useDebounce } from './useDebounce';

export function useSearch(tools: Tool[]) {
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    tags: [],
    price: [],
    minRating: 0,
    search: '',
    sortBy: 'rating',
    sortOrder: 'desc',
  });
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(filters.search || '', 300);

  useEffect(() => {
    if (debouncedSearch) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 200);
      return () => clearTimeout(timer);
    }
  }, [debouncedSearch]);

  const filteredTools = useMemo(() => {
    return filterTools(tools, { ...filters, search: debouncedSearch });
  }, [tools, filters, debouncedSearch]);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: 'all',
      tags: [],
      price: [],
      minRating: 0,
      search: '',
      sortBy: 'rating',
      sortOrder: 'desc',
    });
  };

  return {
    filters,
    filteredTools,
    updateFilter,
    resetFilters,
    isLoading,
  };
}
