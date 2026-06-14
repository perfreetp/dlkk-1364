import React from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  Star,
  GitCompare,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/common/Card';
import { TagBadge } from '@/components/common/TagBadge';
import { Rating } from '@/components/common/Rating';
import { CollectionSelector } from '@/components/business/CollectionSelector';
import type { Tool } from '@/types';
import { PRICE_LABELS, PRICE_COLORS } from '@/types';
import { useToolStore } from '@/store/useToolStore';
import { useUIStore } from '@/store/useUIStore';

interface ToolCardProps {
  tool: Tool;
  viewMode?: 'card' | 'list';
  showActions?: boolean;
  onOpen?: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  viewMode = 'card',
  showActions = true,
  onOpen,
}) => {
  const markAsUsed = useToolStore((state) => state.markAsUsed);
  const addToCompare = useToolStore((state) => state.addToCompare);
  const compareList = useToolStore((state) => state.compareList);
  const showToast = useUIStore((state) => state.showToast);

  const isInCompare = compareList.includes(tool.id);

  const handleVisit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markAsUsed(tool.id);
    window.open(tool.url, '_blank', 'noopener,noreferrer');
    showToast(`已打开 ${tool.name}`, 'success');
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCompare) {
      showToast('已在对比列表中', 'info');
      return;
    }
    const success = addToCompare(tool.id);
    if (success) {
      showToast(`已添加 ${tool.name} 到对比列表`, 'success');
    } else {
      showToast('对比列表最多支持4个工具', 'error');
    }
  };

  const formatLastUsed = (timestamp?: number) => {
    if (!timestamp) return '从未使用';
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    if (days < 30) return `${Math.floor(days / 7)}周前`;
    return `${Math.floor(days / 30)}个月前`;
  };

  const tagColors = ['blue', 'green', 'amber', 'purple', 'cyan', 'pink'];

  if (viewMode === 'list') {
    return (
      <Card hoverable className="flex items-center gap-4 p-4">
        <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
          {tool.screenshots[0] ? (
            <img
              src={tool.screenshots[0].url}
              alt={tool.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-cyan-100">
              <span className="text-2xl font-bold text-brand-600">
                {tool.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{tool.name}</h3>
            {!tool.isLinkValid && (
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-red-50 text-red-600 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                链接失效
              </span>
            )}
            <span className={cn('flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full', PRICE_COLORS[tool.price])}>
              {PRICE_LABELS[tool.price]}
            </span>
          </div>
          <p className="text-sm text-gray-500 line-clamp-1 mb-2">{tool.description}</p>
          <div className="flex items-center gap-4">
            <Rating value={tool.rating} size="sm" showValue readonly />
            <span className="text-xs text-gray-400">{tool.reviewCount} 条评价</span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatLastUsed(tool.lastUsedAt)}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2">
          {tool.tags.slice(0, 2).map((tag, idx) => (
            <TagBadge key={tag} label={tag} color={tagColors[idx % tagColors.length]} size="sm" />
          ))}
          {tool.tags.length > 2 && (
            <span className="text-xs text-gray-400">+{tool.tags.length - 2}</span>
          )}
        </div>

        {showActions && (
          <div className="flex-shrink-0 flex items-center gap-1">
            <button
              onClick={handleVisit}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="访问工具"
            >
              <ExternalLink className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={handleCompare}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isInCompare ? 'bg-brand-100 text-brand-600' : 'hover:bg-gray-100 text-gray-500'
              )}
              title="添加到对比"
            >
              <GitCompare className="w-4 h-4" />
            </button>
            <CollectionSelector toolId={tool.id} />
          </div>
        )}
      </Card>
    );
  }

  return (
    <Link to={`/tool/${tool.id}`} onClick={onOpen}>
      <Card hoverable className="group h-full flex flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          {tool.screenshots[0] ? (
            <img
              src={tool.screenshots[0].url}
              alt={tool.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-400 via-brand-500 to-cyan-500">
              <span className="text-5xl font-bold text-white/20">
                {tool.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            {!tool.isLinkValid && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-500/90 text-white rounded-lg backdrop-blur-sm">
                <AlertTriangle className="w-3 h-3" />
                链接失效
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3">
            <span className={cn('px-2.5 py-1 text-xs font-medium rounded-lg backdrop-blur-sm', PRICE_COLORS[tool.price], 'bg-opacity-90')}>
              {PRICE_LABELS[tool.price]}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-1 text-white">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{tool.rating}</span>
            </div>
            <button
              onClick={handleVisit}
              className="px-3 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-colors"
            >
              立即访问
            </button>
          </div>
        </div>

        <Card.Body className="flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
              {tool.name}
            </h3>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
            {tool.description}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tool.tags.slice(0, 3).map((tag, idx) => (
              <TagBadge
                key={tag}
                label={tag}
                color={tagColors[idx % tagColors.length]}
                size="sm"
              />
            ))}
            {tool.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded-full">
                +{tool.tags.length - 3}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Rating value={tool.rating} size="sm" readonly />
              <span className="text-xs text-gray-400 ml-1">({tool.reviewCount})</span>
            </div>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatLastUsed(tool.lastUsedAt)}
            </span>
          </div>
        </Card.Body>

        {showActions && (
          <Card.Footer className="flex items-center justify-between gap-2">
            <button
              onClick={handleCompare}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-colors',
                isInCompare
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <GitCompare className="w-4 h-4" />
              对比
            </button>
            <CollectionSelector
              toolId={tool.id}
              trigger={
                <span className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                  <span className="w-4 h-4">📌</span>
                  收藏
                </span>
              }
            />
          </Card.Footer>
        )}
      </Card>
    </Link>
  );
};
