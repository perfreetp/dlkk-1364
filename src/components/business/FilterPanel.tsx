import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, Grid3X3, List, Star, BookmarkPlus, Save, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/common/Input';
import { TagBadge } from '@/components/common/TagBadge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import type { FilterOptions, Tool } from '@/types';
import { CATEGORIES, PRICE_LABELS, PRICE_COLORS } from '@/types';
import { useCollectionStore } from '@/store/useCollectionStore';
import { useUIStore } from '@/store/useUIStore';

interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: any) => void;
  onReset: () => void;
  viewMode: 'card' | 'list';
  onViewModeChange: (mode: 'card' | 'list') => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onReset,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
}) => {
  const getAllTags = useCollectionStore((state) => state.getAllTags);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const filterPresets = useUIStore((state) => state.filterPresets);
  const saveFilterPreset = useUIStore((state) => state.saveFilterPreset);
  const applyFilterPreset = useUIStore((state) => state.applyFilterPreset);
  const deleteFilterPreset = useUIStore((state) => state.deleteFilterPreset);
  const updateFilterPreset = useUIStore((state) => state.updateFilterPreset);
  const showToast = useUIStore((state) => state.showToast);

  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [hoveredPresetId, setHoveredPresetId] = useState<string | null>(null);

  const allTags = getAllTags();
  const tagColors = ['blue', 'green', 'amber', 'purple', 'cyan', 'pink', 'orange', 'teal'];

  const priceOptions: Array<{ value: Tool['price']; label: string; color: string }> = [
    { value: 'free', label: PRICE_LABELS.free, color: PRICE_COLORS.free },
    { value: 'freemium', label: PRICE_LABELS.freemium, color: PRICE_COLORS.freemium },
    { value: 'paid', label: PRICE_LABELS.paid, color: PRICE_COLORS.paid },
  ];

  const ratingOptions = [0, 3, 4, 4.5];

  const hasActiveFilters = 
    filters.category !== 'all' ||
    (filters.tags && filters.tags.length > 0) ||
    (filters.price && filters.price.length > 0) ||
    (filters.minRating && filters.minRating > 0) ||
    filters.search;

  const handleTagClick = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    onFilterChange('tags', newTags);
  };

  const handlePriceClick = (price: Tool['price']) => {
    const currentPrices = filters.price || [];
    const newPrices = currentPrices.includes(price)
      ? currentPrices.filter((p) => p !== price)
      : [...currentPrices, price];
    onFilterChange('price', newPrices);
  };

  const handleOpenSaveModal = () => {
    setPresetName('');
    setEditingPresetId(null);
    setShowPresetModal(true);
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      showToast('请输入方案名称', 'error');
      return;
    }
    const existing = filterPresets.find((p) => p.name === presetName.trim());
    if (existing) {
      updateFilterPreset(existing.id);
      showToast(`已更新方案「${presetName.trim()}」`, 'success');
    } else {
      saveFilterPreset(presetName.trim());
      showToast(`已保存方案「${presetName.trim()}」`, 'success');
    }
    setShowPresetModal(false);
    setPresetName('');
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = filterPresets.find((p) => p.id === presetId);
    if (preset) {
      applyFilterPreset(presetId);
      Object.entries(preset.filters).forEach(([key, value]) => {
        onFilterChange(key as keyof FilterOptions, value);
      });
      showToast(`已应用方案「${preset.name}」`, 'success');
    }
  };

  const handleDeletePreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const preset = filterPresets.find((p) => p.id === presetId);
    if (preset) {
      deleteFilterPreset(presetId);
      showToast(`已删除方案「${preset.name}」`, 'info');
    }
  };

  const handleOverwritePreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const preset = filterPresets.find((p) => p.id === presetId);
    if (preset) {
      updateFilterPreset(presetId);
      showToast(`已更新方案「${preset.name}」`, 'success');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <Input
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="搜索工具名称、描述、标签..."
            icon={<Search className="w-4 h-4" />}
            className="w-full lg:w-80"
          />
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<BookmarkPlus className="w-4 h-4" />}
            onClick={handleOpenSaveModal}
          >
            保存筛选
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              icon={<X className="w-4 h-4" />}
              onClick={onReset}
            >
              清除筛选
            </Button>
          )}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('card')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'card'
                  ? 'bg-white shadow text-brand-600'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-white shadow text-brand-600'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-500">
            显示 <span className="font-semibold text-gray-900">{filteredCount}</span> / {totalCount} 个工具
          </div>
        </div>
      </div>

      {filterPresets.length > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">
              筛选方案
            </span>
            {filterPresets.map((preset, idx) => (
              <div
                key={preset.id}
                className="relative inline-flex items-center group"
                onMouseEnter={() => setHoveredPresetId(preset.id)}
                onMouseLeave={() => setHoveredPresetId(null)}
              >
                <TagBadge
                  label={preset.name}
                  color={tagColors[idx % tagColors.length]}
                  onClick={() => handleApplyPreset(preset.id)}
                  className="pr-8"
                />
                {hoveredPresetId === preset.id && (
                  <div className="absolute right-1 flex items-center gap-0.5">
                    <button
                      onClick={(e) => handleOverwritePreset(preset.id, e)}
                      className="p-0.5 hover:bg-black/10 rounded transition-colors"
                      title="覆盖更新"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeletePreset(preset.id, e)}
                      className="p-0.5 hover:bg-black/10 rounded transition-colors"
                      title="删除"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">
            分类
          </span>
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => onFilterChange('category', category.id)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200',
                filters.category === category.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">
            价格
          </span>
          {priceOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePriceClick(option.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200',
                filters.price?.includes(option.value)
                  ? 'bg-brand-600 text-white shadow-md'
                  : option.color + ' hover:opacity-80'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">
            评分
          </span>
          {ratingOptions.map((rating) => (
            <button
              key={rating}
              onClick={() => onFilterChange('minRating', filters.minRating === rating ? 0 : rating)}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200',
                filters.minRating === rating
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <Star className={cn('w-3.5 h-3.5', filters.minRating === rating ? 'fill-white' : 'fill-amber-400 text-amber-400')} />
              {rating === 0 ? '全部' : `${rating}+`}
            </button>
          ))}
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">
              标签
            </span>
            {allTags.map((tag, idx) => (
              <TagBadge
                key={tag}
                label={tag}
                color={tagColors[idx % tagColors.length]}
                selected={filters.tags?.includes(tag)}
                onClick={() => handleTagClick(tag)}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            排序
          </span>
          <select
            value={filters.sortBy || 'rating'}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="px-3 py-1.5 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <option value="rating">评分最高</option>
            <option value="recent">最近使用</option>
            <option value="created">最新添加</option>
            <option value="name">名称排序</option>
          </select>
        </div>
      </div>

      <Modal
        isOpen={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        title="保存筛选方案"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowPresetModal(false)}
            >
              取消
            </Button>
            <Button
              variant="primary"
              icon={<Save className="w-4 h-4" />}
              onClick={handleSavePreset}
            >
              保存
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            为当前筛选条件设置一个名称，方便以后快速使用。
          </p>
          <Input
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="请输入方案名称"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSavePreset();
              }
            }}
          />
          {filterPresets.some((p) => p.name === presetName.trim()) && (
            <p className="text-sm text-amber-600">
              ⚠️ 该名称已存在，将覆盖原有方案
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};
