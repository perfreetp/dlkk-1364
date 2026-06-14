import { useMemo, useEffect, useState } from 'react';
import type { Tool, FilterOptions } from '@/types';
import { filterTools } from '@/utils/searchFilter';
import { useDebounce } from './useDebounce';

export function useSearch(tools: Tool[], externalFilters?: FilterOptions) {
  const [internalFilters, setInternalFilters] = useState<FilterOptions>({
    category: 'all',
    tags: [],
    price: [],
    minRating: 0,
    search: '',
    sortBy: 'rating',
    sortOrder: 'desc',
  });
  const [isLoading, setIsLoading] = useState(false);

  const filters = externalFilters ?? internalFilters;

  const debouncedSearch = useDebounce(filters.search || '', 300);

  useEffect(() => {
    if (debouncedSearch) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 200);
      return () => clearTimeout(timer);
    }
    setIsLoading(false);
  }, [debouncedSearch]);

  const filteredTools = useMemo(() => {
    return filterTools(tools, { ...filters, search: debouncedSearch });
  }, [tools, filters, debouncedSearch]);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setInternalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setInternalFilters({
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
