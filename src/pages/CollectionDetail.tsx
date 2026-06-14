import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Share2,
  Download,
  Edit3,
  Trash2,
  Plus,
  X,
  ExternalLink,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ToolCard } from '@/components/business/ToolCard';
import { Empty } from '@/components/Empty';
import { Modal } from '@/components/common/Modal';
import { Input, TextArea } from '@/components/common/Input';
import { FilterPanel } from '@/components/business/FilterPanel';
import { useSearch } from '@/hooks/useSearch';
import { useToolStore } from '@/store/useToolStore';
import { useCollectionStore } from '@/store/useCollectionStore';
import { useUIStore } from '@/store/useUIStore';
import { CATEGORIES, PRICE_COLORS, PRICE_LABELS } from '@/types';
import type { Collection, Tool } from '@/types';
import { cn } from '@/lib/utils';

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPublic, setEditPublic] = useState(false);
  const [showAddToolModal, setShowAddToolModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getCollectionById = useCollectionStore((state) => state.getCollectionById);
  const updateCollection = useCollectionStore((state) => state.updateCollection);
  const deleteCollection = useCollectionStore((state) => state.deleteCollection);
  const removeToolFromCollection = useCollectionStore((state) => state.removeToolFromCollection);
  const addToolToCollection = useCollectionStore((state) => state.addToolToCollection);
  const shareCollection = useCollectionStore((state) => state.shareCollection);
  const exportCollection = useCollectionStore((state) => state.exportCollection);

  const tools = useToolStore((state) => state.tools);
  const getToolById = useToolStore((state) => state.getToolById);
  const markAsUsed = useToolStore((state) => state.markAsUsed);

  const filters = useUIStore((state) => state.filters);
  const viewMode = useUIStore((state) => state.viewMode);
  const setFilters = useUIStore((state) => state.setFilters);
  const resetFilters = useUIStore((state) => state.resetFilters);
  const setViewMode = useUIStore((state) => state.setViewMode);
  const showToast = useUIStore((state) => state.showToast);

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters({ [key]: value });
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  const handleViewModeChange = (mode: 'card' | 'list') => {
    setViewMode(mode);
  };

  const collection = id ? getCollectionById(id) : null;

  const collectionTools = collection
    ? collection.toolIds
        .map((tid) => getToolById(tid))
        .filter((t): t is Tool => t !== undefined)
    : [];

  const { filteredTools, isLoading } = useSearch(collectionTools, filters);

  const availableTools = tools.filter(
    (t) =>
      !collection?.toolIds.includes(t.id) &&
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!collection) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Empty
          icon="folder"
          title="收藏夹不存在"
          description="该收藏夹可能已被删除或链接无效"
        />
        <div className="mt-6 text-center">
          <Link to="/profile">
            <Button variant="primary" leftIcon={<ChevronLeft className="w-4 h-4" />}>
              返回个人中心
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setEditName(collection.name);
    setEditDesc(collection.description);
    setEditPublic(collection.isPublic);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      showToast('请输入收藏夹名称', 'error');
      return;
    }
    updateCollection(collection.id, {
      name: editName.trim(),
      description: editDesc.trim(),
      isPublic: editPublic,
    });
    showToast('收藏夹已更新', 'success');
    setShowEditModal(false);
  };

  const handleDelete = () => {
    if (confirm('确定要删除这个收藏夹吗？收藏夹内的工具不会被删除。')) {
      deleteCollection(collection.id);
      showToast('收藏夹已删除', 'info');
      window.location.href = '/profile';
    }
  };

  const handleShare = async () => {
    const success = await shareCollection(collection.id);
    if (success) {
      showToast('分享内容已复制到剪贴板', 'success');
    } else {
      showToast('分享失败', 'error');
    }
  };

  const handleExport = (format: 'json' | 'html') => {
    exportCollection(collection.id, format);
    showToast('导出成功', 'success');
  };

  const handleAddTool = (toolId: string) => {
    addToolToCollection(collection.id, toolId);
    showToast('已添加到收藏夹', 'success');
    setShowAddToolModal(false);
    setSearchQuery('');
  };

  const handleRemoveTool = (toolId: string) => {
    removeToolFromCollection(collection.id, toolId);
    showToast('已从收藏夹移除', 'info');
  };

  const handleVisit = (tool: Tool) => {
    markAsUsed(tool.id);
    window.open(tool.url, '_blank', 'noopener,noreferrer');
    showToast(`已打开 ${tool.name}`, 'success');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      <Link
        to="/profile"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        返回个人中心
      </Link>

      <Card className="bg-gradient-to-br from-brand-500 to-cyan-600 text-white border-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptLTYgMGg0djFoLTR2LTF6bTEyLTZoLTR2MWg0di0xem0tNiAwaC00djFoNHYtMXptLTYgMGgtNHYxaDR2LTF6bTEyLTZoLTR2MWg0di0xem0tNiAwaC00djFoNHYtMXptLTYgMGgtNHYxaDR2LTF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <Card.Body className="relative">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold">
                {collection.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold">{collection.name}</h1>
                  {collection.isPublic && (
                    <span className="px-2.5 py-1 text-xs bg-white/20 backdrop-blur-sm rounded-full">
                      公开
                    </span>
                  )}
                </div>
                <p className="text-white/80 mt-1 max-w-xl">
                  {collection.description || '暂无描述'}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-white/70">
                  <span>{collection.toolIds.length} 个工具</span>
                  <span>创建于 {formatDate(collection.createdAt)}</span>
                  <span>更新于 {formatDate(collection.updatedAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleShare}
                className="bg-white/10 text-white hover:bg-white/20 border-0"
                leftIcon={<Share2 className="w-4 h-4" />}
              >
                分享
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport('html')}
                className="bg-white/10 text-white hover:bg-white/20 border-0"
                leftIcon={<Download className="w-4 h-4" />}
              >
                导出
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleEdit}
                className="bg-white/10 text-white hover:bg-white/20 border-0"
                leftIcon={<Edit3 className="w-4 h-4" />}
              >
                编辑
              </Button>
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="删除"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          工具列表
          <span className="text-gray-400 font-normal ml-2">
            ({filteredTools.length}/{collectionTools.length})
          </span>
        </h2>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddToolModal(true)}
        >
          添加工具
        </Button>
      </div>

      {collectionTools.length > 0 && (
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          totalCount={collectionTools.length}
          filteredCount={filteredTools.length}
        />
      )}

      {collectionTools.length === 0 ? (
        <div className="max-w-md mx-auto py-16">
          <Empty
            icon="tool"
            title="收藏夹为空"
            description="添加一些工具到这个收藏夹吧"
          />
          <div className="mt-6 flex justify-center">
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddToolModal(true)}
            >
              添加工具
            </Button>
          </div>
        </div>
      ) : filteredTools.length === 0 ? (
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
            <div key={tool.id} className="relative group">
              <ToolCard tool={tool} viewMode="card" showActions={false} />
              <button
                onClick={() => handleRemoveTool(tool.id)}
                className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                title="从收藏夹移除"
              >
                <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTools.map((tool) => (
            <div key={tool.id} className="relative group">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <ToolCard tool={tool} viewMode="list" showActions={false} />
                </div>
                <button
                  onClick={() => handleRemoveTool(tool.id)}
                  className="p-2 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="从收藏夹移除"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="编辑收藏夹"
        size="sm"
      >
        <div className="space-y-6">
          <Input
            label="收藏夹名称"
            placeholder="例如：UI 设计工具集"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
          />
          <TextArea
            label="描述（可选）"
            placeholder="简单描述这个收藏夹的用途"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            rows={3}
          />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="editPublic"
              checked={editPublic}
              onChange={(e) => setEditPublic(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
            />
            <label htmlFor="editPublic" className="text-sm text-gray-700">
              设为公开收藏夹（可生成分享链接）
            </label>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowEditModal(false)}
            >
              取消
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleSaveEdit}>
              保存
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showAddToolModal}
        onClose={() => {
          setShowAddToolModal(false);
          setSearchQuery('');
        }}
        title="添加工具到收藏夹"
        size="lg"
      >
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索工具名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {availableTools.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">没有可添加的工具</p>
              <p className="text-sm text-gray-400 mt-1">所有工具都已在收藏夹中</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto scrollbar-thin space-y-2">
              {availableTools.slice(0, 15).map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleAddTool(tool.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {tool.screenshots[0] ? (
                      <img
                        src={tool.screenshots[0].url}
                        alt={tool.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-400 to-cyan-400">
                        <span className="text-lg font-bold text-white">
                          {tool.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{tool.name}</p>
                      {!tool.isLinkValid && (
                        <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{tool.description}</p>
                  </div>
                  <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddToolModal(false);
                setSearchQuery('');
              }}
            >
              关闭
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
