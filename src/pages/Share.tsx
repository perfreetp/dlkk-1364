import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Download,
  ChevronLeft,
  ExternalLink,
  Clock,
  Check,
  Copy,
  Grid3X3,
  List,
  Filter,
  X,
  Star,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Rating } from '@/components/common/Rating';
import { TagBadge } from '@/components/common/TagBadge';
import { Empty } from '@/components/Empty';
import { useCollectionStore } from '@/store/useCollectionStore';
import { useUIStore } from '@/store/useUIStore';
import { CATEGORIES, PRICE_COLORS, PRICE_LABELS } from '@/types';
import { cn } from '@/lib/utils';
import { downloadFile } from '@/utils/exportUtils';

type PriceType = 'free' | 'freemium' | 'paid';

interface ShareFilters {
  category: string;
  price: PriceType[];
  minRating: number;
}

const DEFAULT_FILTERS: ShareFilters = {
  category: 'all',
  price: [],
  minRating: 0,
};

export default function Share() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [filters, setFilters] = useState<ShareFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [showFilters, setShowFilters] = useState(false);

  const getSharedCollection = useCollectionStore((state) => state.getSharedCollection);
  const getToolById = useCollectionStore((state) => state.getToolById);
  const showToast = useUIStore((state) => state.showToast);

  const sharedData = token ? getSharedCollection(token) : null;
  const collection = sharedData?.collection;
  const tools = sharedData?.tools || [];

  const tagColors = ['blue', 'green', 'amber', 'purple', 'cyan', 'pink'];

  const priceOptions: Array<{ value: PriceType; label: string; color: string }> = [
    { value: 'free', label: PRICE_LABELS.free, color: PRICE_COLORS.free },
    { value: 'freemium', label: PRICE_LABELS.freemium, color: PRICE_COLORS.freemium },
    { value: 'paid', label: PRICE_LABELS.paid, color: PRICE_COLORS.paid },
  ];

  const ratingOptions = [0, 3, 4, 4.5];

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      if (filters.category !== 'all' && tool.category !== filters.category) {
        return false;
      }
      if (filters.price.length > 0 && !filters.price.includes(tool.price)) {
        return false;
      }
      if (filters.minRating > 0 && tool.rating < filters.minRating) {
        return false;
      }
      return true;
    });
  }, [tools, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.price.length > 0) count++;
    if (filters.minRating > 0) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  const handleFilterChange = <K extends keyof ShareFilters>(
    key: K,
    value: ShareFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setShowFilters(false);
  };

  const handlePriceToggle = (price: PriceType) => {
    const current = filters.price;
    const next = current.includes(price)
      ? current.filter((p) => p !== price)
      : [...current, price];
    handleFilterChange('price', next);
  };

  const handleRatingToggle = (rating: number) => {
    handleFilterChange('minRating', filters.minRating === rating ? 0 : rating);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCopyLink = async () => {
    if (!collection) return;
    const shareUrl = `${window.location.origin}/share/${collection.shareToken}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('分享链接已复制', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('复制失败，请手动复制', 'error');
    }
  };

  const handleExportJSON = () => {
    if (!collection) return;
    const data = {
      version: '1.0',
      exportedAt: Date.now(),
      collection: {
        name: collection.name,
        description: collection.description,
      },
      tools,
    };
    const content = JSON.stringify(data, null, 2);
    downloadFile(content, `${collection.name}-分享.json`, 'application/json');
    showToast('导出成功', 'success');
  };

  const handleGoBack = () => {
    navigate('/');
  };

  if (!collection) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Empty
          icon="folder"
          title="分享链接无效或已过期"
          description="该分享可能已被取消或链接不正确"
        />
        <div className="mt-6 text-center">
          <Button variant="primary" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={handleGoBack}>
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  const FilterSection = () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between lg:hidden">
        <h3 className="font-semibold text-gray-900">筛选条件</h3>
        <button
          onClick={() => setShowFilters(false)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">
          分类
        </span>
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => handleFilterChange('category', category.id)}
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
            onClick={() => handlePriceToggle(option.value)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200',
              filters.price.includes(option.value)
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
            onClick={() => handleRatingToggle(rating)}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200',
              filters.minRating === rating
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <Star
              className={cn(
                'w-3.5 h-3.5',
                filters.minRating === rating ? 'fill-white' : 'fill-amber-400 text-amber-400'
              )}
            />
            {rating === 0 ? '全部' : `${rating}+`}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          已选 <span className="font-semibold text-gray-900">{activeFilterCount}</span> 个筛选
        </span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" icon={<X className="w-4 h-4" />} onClick={handleResetFilters}>
            清除筛选
          </Button>
        )}
      </div>
    </div>
  );

  const renderToolCard = (tool: (typeof tools)[number]) => {
    const categoryInfo = CATEGORIES.find((c) => c.id === tool.category);
    return (
      <Link key={tool.id} to={`/tool/${tool.id}`} className="block group">
        <Card hoverable>
          <Card.Body className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {tool.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                    {tool.name}
                  </h3>
                  <span
                    className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded-lg',
                      PRICE_COLORS[tool.price]
                    )}
                  >
                    {PRICE_LABELS[tool.price]}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1">
                    <Rating value={tool.rating} size="sm" readonly />
                    <span className="text-sm text-gray-500 ml-1">{tool.rating}</span>
                  </div>
                  {categoryInfo && (
                    <span className="text-sm text-gray-500">{categoryInfo.name}</span>
                  )}
                </div>
                <p className="text-gray-600 mt-2 line-clamp-2">{tool.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {tool.tags.map((tag, idx) => (
                    <TagBadge
                      key={tag}
                      label={tag}
                      color={tagColors[idx % tagColors.length]}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0">
                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-brand-500 transition-colors" />
              </div>
            </div>

            {tool.screenshots.length > 0 && (
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {tool.screenshots.slice(0, 3).map((screenshot, idx) => (
                  <div
                    key={screenshot.id}
                    className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
                  >
                    <img
                      src={screenshot.url}
                      alt={screenshot.caption || `Screenshot ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {tool.alternatives && tool.alternatives.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">替代工具：</p>
                <div className="flex flex-wrap gap-2">
                  {tool.alternatives.map((altId) => {
                    const altTool = getToolById(altId);
                    if (!altTool) return null;
                    return (
                      <Link
                        key={altId}
                        to={`/tool/${altId}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TagBadge
                          label={altTool.name}
                          color="gray"
                          className="hover:bg-gray-200"
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </Link>
    );
  };

  const renderToolList = (tool: (typeof tools)[number]) => {
    const categoryInfo = CATEGORIES.find((c) => c.id === tool.category);
    return (
      <Link
        key={tool.id}
        to={`/tool/${tool.id}`}
        className="block group"
      >
        <Card hoverable>
          <Card.Body>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 flex-shrink-0 min-w-0 w-48 lg:w-56">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {tool.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
                    {tool.name}
                  </h3>
                  {categoryInfo && (
                    <p className="text-xs text-gray-500 truncate">{categoryInfo.name}</p>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 line-clamp-1">{tool.description}</p>
                {tool.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tool.tags.slice(0, 3).map((tag, idx) => (
                      <TagBadge
                        key={tag}
                        label={tag}
                        color={tagColors[idx % tagColors.length]}
                        size="xs"
                      />
                    ))}
                    {tool.tags.length > 3 && (
                      <span className="text-xs text-gray-400 px-1">+{tool.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                {tool.screenshots.length > 0 && (
                  <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                    <span className="w-4 h-3 border border-gray-300 rounded-sm" />
                    {tool.screenshots.length}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-md',
                      PRICE_COLORS[tool.price]
                    )}
                  >
                    {PRICE_LABELS[tool.price]}
                  </span>
                </div>
                <div className="flex items-center gap-1 w-16 justify-end">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{tool.rating}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ExternalLink className="w-4 h-4" />}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/tool/${tool.id}`);
                  }}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      <button
        onClick={handleGoBack}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        返回首页
      </button>

      <Card className="bg-gradient-to-br from-brand-500 to-cyan-600 text-white border-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptLTYgMGg0djFoLTR2LTF6bTEyLTZoLTR2MWg0di0xem0tNiAwaC00djFoNHYtMXptLTYgMGgtNHYxaDR2LTF6bTEyLTZoLTR2MWg0di0xem0tNiAwaC00djFoNHYtMXptLTYgMGgtNHYxaDR2LTF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <Card.Body className="relative">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold">
                {collection.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{collection.name}</h1>
                <p className="text-white/80 mt-1 max-w-xl">
                  {collection.description || '暂无描述'}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-white/70">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    创建于 {formatDate(collection.createdAt)}
                  </span>
                  <span>{tools.length} 个工具</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyLink}
                className="bg-white/10 text-white hover:bg-white/20 border-0"
                leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? '已复制' : '复制链接'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportJSON}
                className="bg-white/10 text-white hover:bg-white/20 border-0"
                leftIcon={<Download className="w-4 h-4" />}
              >
                导出 JSON
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">工具列表</h2>
          <span className="text-sm text-gray-500">
            显示 <span className="font-semibold text-gray-900">{filteredTools.length}</span> /{' '}
            {tools.length} 个工具
          </span>
        </div>

        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-sm">
              <span>已选 {activeFilterCount} 个筛选</span>
              <button
                onClick={handleResetFilters}
                className="p-0.5 hover:bg-brand-100 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors lg:hidden',
              hasActiveFilters
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <Filter className="w-4 h-4" />
            <span>筛选</span>
            {hasActiveFilters && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'card'
                  ? 'bg-white shadow text-brand-600'
                  : 'text-gray-400 hover:text-gray-600'
              )}
              title="卡片视图"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-white shadow text-brand-600'
                  : 'text-gray-400 hover:text-gray-600'
              )}
              title="列表视图"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <FilterSection />
      </div>

      {showFilters && (
        <div className="lg:hidden">
          <FilterSection />
        </div>
      )}

      {showFilters && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}

      {tools.length === 0 ? (
        <div className="max-w-md mx-auto py-16">
          <Empty
            icon="tool"
            title="收藏夹为空"
            description="这个收藏夹还没有添加任何工具"
          />
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="max-w-md mx-auto py-16">
          <Empty
            icon="search"
            title="没有找到匹配的工具"
            description="尝试调整筛选条件"
          />
          <div className="mt-6 text-center">
            <Button variant="primary" onClick={handleResetFilters}>
              清除筛选条件
            </Button>
          </div>
        </div>
      ) : viewMode === 'card' ? (
        <div className="space-y-6">{filteredTools.map(renderToolCard)}</div>
      ) : (
        <div className="space-y-3">{filteredTools.map(renderToolList)}</div>
      )}
    </div>
  );
}
