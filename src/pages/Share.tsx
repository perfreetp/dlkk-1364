import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Download,
  ChevronLeft,
  ExternalLink,
  Clock,
  Check,
  Copy,
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

export default function Share() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const getSharedCollection = useCollectionStore((state) => state.getSharedCollection);
  const getToolById = useCollectionStore((state) => state.getToolById);
  const showToast = useUIStore((state) => state.showToast);

  const sharedData = token ? getSharedCollection(token) : null;
  const collection = sharedData?.collection;
  const tools = sharedData?.tools || [];

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

  const tagColors = ['blue', 'green', 'amber', 'purple', 'cyan', 'pink'];

  return (
    <div className="space-y-8">
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

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          工具列表
          <span className="text-gray-400 font-normal ml-2">
            ({tools.length})
          </span>
        </h2>
      </div>

      {tools.length === 0 ? (
        <div className="max-w-md mx-auto py-16">
          <Empty
            icon="tool"
            title="收藏夹为空"
            description="这个收藏夹还没有添加任何工具"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {tools.map((tool) => {
            const categoryInfo = CATEGORIES.find((c) => c.id === tool.category);
            return (
              <Link
                key={tool.id}
                to={`/tool/${tool.id}`}
                className="block group"
              >
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
                          <span className={cn('px-2.5 py-1 text-xs font-medium rounded-lg', PRICE_COLORS[tool.price])}>
                            {PRICE_LABELS[tool.price]}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1">
                            <Rating value={tool.rating} size="sm" readonly />
                            <span className="text-sm text-gray-500 ml-1">
                              {tool.rating}
                            </span>
                          </div>
                          {categoryInfo && (
                            <span className="text-sm text-gray-500">
                              {categoryInfo.name}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-2 line-clamp-2">
                          {tool.description}
                        </p>
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
          })}
        </div>
      )}
    </div>
  );
}
