import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ToolCard } from '@/components/business/ToolCard';
import { FilterPanel } from '@/components/business/FilterPanel';
import { Empty } from '@/components/Empty';
import { useSearch } from '@/hooks/useSearch';
import { useToolStore } from '@/store/useToolStore';
import { useUIStore } from '@/store/useUIStore';
import type { FilterOptions } from '@/types';

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitRef = useRef(true);
  const isSyncingRef = useRef(false);

  const tools = useToolStore((state) => state.tools);
  const filters = useUIStore((state) => state.filters);
  const viewMode = useUIStore((state) => state.viewMode);
  const setFilters = useUIStore((state) => state.setFilters);
  const resetFilters = useUIStore((state) => state.resetFilters);
  const setViewMode = useUIStore((state) => state.setViewMode);

  const { filteredTools, isLoading } = useSearch(tools, filters);

  useEffect(() => {
    if (!isInitRef.current) return;
    isInitRef.current = false;

    const paramsFromUrl: Partial<FilterOptions> = {};
    
    const search = searchParams.get('search');
    if (search) paramsFromUrl.search = search;
    
    const category = searchParams.get('category');
    if (category) paramsFromUrl.category = category;
    
    const tags = searchParams.get('tags');
    if (tags) paramsFromUrl.tags = tags.split(',').filter(Boolean);
    
    const price = searchParams.get('price');
    if (price) paramsFromUrl.price = price.split(',').filter(Boolean) as FilterOptions['price'];
    
    const minRating = searchParams.get('minRating');
    if (minRating) paramsFromUrl.minRating = parseFloat(minRating);
    
    const sortBy = searchParams.get('sortBy');
    if (sortBy) paramsFromUrl.sortBy = sortBy as FilterOptions['sortBy'];

    if (Object.keys(paramsFromUrl).length > 0) {
      isSyncingRef.current = true;
      resetFilters();
      setFilters(paramsFromUrl);
      setTimeout(() => { isSyncingRef.current = false; }, 50);
    }
  }, [searchParams, resetFilters, setFilters]);

  useEffect(() => {
    if (isInitRef.current || isSyncingRef.current) return;

    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.category && filters.category !== 'all') params.category = filters.category;
    if (filters.tags && filters.tags.length > 0) params.tags = filters.tags.join(',');
    if (filters.price && filters.price.length > 0) params.price = filters.price.join(',');
    if (filters.minRating && filters.minRating > 0) params.minRating = String(filters.minRating);
    if (filters.sortBy) params.sortBy = filters.sortBy;

    const keys = Object.keys(params);
    if (keys.length === 0) {
      if (Array.from(searchParams.keys()).length > 0) {
        setSearchParams({}, { replace: true });
      }
    } else {
      setSearchParams(params, { replace: true });
    }
  }, [filters, searchParams, setSearchParams]);

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters({ [key]: value });
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  const handleViewModeChange = (mode: 'card' | 'list') => {
    setViewMode(mode);
  };

  if (tools.length === 0) {
    return (
      <div className="max-w-md mx-auto">
        <Empty
          icon="tool"
          title="还没有收藏任何工具"
          description="开始添加你常用的在线工具，整理属于你的工具库"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        totalCount={tools.length}
        filteredCount={filteredTools.length}
      />

      {filteredTools.length === 0 ? (
        <div className="max-w-md mx-auto py-12">
          <Empty
            icon="search"
            title="没有找到匹配的工具"
            description="尝试调整筛选条件或搜索关键词"
          />
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} viewMode="card" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} viewMode="list" />
          ))}
        </div>
      )}
    </div>
  );
}
