import React from 'react';
import { ToolCard } from '@/components/business/ToolCard';
import { FilterPanel } from '@/components/business/FilterPanel';
import { Empty } from '@/components/Empty';
import { useSearch } from '@/hooks/useSearch';
import { useToolStore } from '@/store/useToolStore';
import { useUIStore } from '@/store/useUIStore';

export default function Library() {
  const tools = useToolStore((state) => state.tools);
  const filters = useUIStore((state) => state.filters);
  const viewMode = useUIStore((state) => state.viewMode);
  const setFilters = useUIStore((state) => state.setFilters);
  const resetFilters = useUIStore((state) => state.resetFilters);
  const setViewMode = useUIStore((state) => state.setViewMode);

  const { filteredTools, isLoading } = useSearch(tools);

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
