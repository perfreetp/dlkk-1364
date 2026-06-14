import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ExternalLink,
  Star,
  GitCompare,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ZoomIn,
  Edit3,
  Trash2,
  BookmarkPlus,
  Share2,
  RefreshCw,
  Check,
  X,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Rating } from '@/components/common/Rating';
import { TagBadge } from '@/components/common/TagBadge';
import { CollectionSelector } from '@/components/business/CollectionSelector';
import { Modal } from '@/components/common/Modal';
import { Input, TextArea } from '@/components/common/Input';
import { Empty } from '@/components/Empty';
import { useToolStore } from '@/store/useToolStore';
import { useCollectionStore } from '@/store/useCollectionStore';
import { useUIStore } from '@/store/useUIStore';
import { CATEGORIES, PRICE_COLORS, PRICE_LABELS } from '@/types';
import type { Note, Review } from '@/types';
import { cn } from '@/lib/utils';

export default function ToolDetail() {
  const { id } = useParams<{ id: string }>();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState('');
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCheckingLink, setIsCheckingLink] = useState(false);

  const getToolById = useToolStore((state) => state.getToolById);
  const getToolReviews = useToolStore((state) => state.getToolReviews);
  const getToolNotes = useToolStore((state) => state.getToolNotes);
  const addReview = useToolStore((state) => state.addReview);
  const addNote = useToolStore((state) => state.addNote);
  const updateNote = useToolStore((state) => state.updateNote);
  const deleteNote = useToolStore((state) => state.deleteNote);
  const markAsUsed = useToolStore((state) => state.markAsUsed);
  const addToCompare = useToolStore((state) => state.addToCompare);
  const compareList = useToolStore((state) => state.compareList);
  const checkLink = useToolStore((state) => state.checkLink);
  const shareCollection = useCollectionStore((state) => state.shareCollection);
  const showToast = useUIStore((state) => state.showToast);
  const openScreenshotViewer = useUIStore((state) => state.openScreenshotViewer);

  const tool = id ? getToolById(id) : null;
  const reviews = tool ? getToolReviews(tool.id) : [];
  const notes = tool ? getToolNotes(tool.id) : [];
  const isInCompare = tool ? compareList.includes(tool.id) : false;

  if (!tool) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Empty
          icon="tool"
          title="工具不存在"
          description="该工具可能已被删除或链接无效"
        />
        <div className="mt-6 text-center">
          <Link to="/library">
            <Button variant="primary" leftIcon={<ChevronLeft className="w-4 h-4" />}>
              返回工具库
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryInfo = CATEGORIES.find((c) => c.id === tool.category);
  const tagColors = ['blue', 'green', 'amber', 'purple', 'cyan', 'pink'];

  const handleVisit = () => {
    markAsUsed(tool.id);
    window.open(tool.url, '_blank', 'noopener,noreferrer');
    showToast(`已打开 ${tool.name}`, 'success');
  };

  const handleCompare = () => {
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

  const handleCheckLink = async () => {
    setIsCheckingLink(true);
    await checkLink(tool.id);
    setIsCheckingLink(false);
    showToast('链接检测完成', 'success');
  };

  const handleSubmitReview = () => {
    if (newRating === 0) {
      showToast('请选择评分', 'error');
      return;
    }
    addReview(tool.id, newRating, newReview);
    showToast('评价提交成功', 'success');
    setShowReviewModal(false);
    setNewRating(0);
    setNewReview('');
  };

  const handleSubmitNote = () => {
    if (!newNote.trim()) {
      showToast('请输入笔记内容', 'error');
      return;
    }
    if (editingNote) {
      updateNote(editingNote.id, newNote);
      showToast('笔记已更新', 'success');
    } else {
      addNote(tool.id, newNote);
      showToast('笔记已添加', 'success');
    }
    setShowNoteModal(false);
    setNewNote('');
    setEditingNote(null);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNewNote(note.content);
    setShowNoteModal(true);
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    showToast('笔记已删除', 'info');
  };

  const handleShare = async () => {
    const content = `【${tool.name}】\n${tool.description}\n${tool.url}\n\n—— 来自我的工具收藏夹`;
    try {
      await navigator.clipboard.writeText(content);
      showToast('分享内容已复制到剪贴板', 'success');
    } catch {
      showToast('复制失败，请手动复制', 'error');
    }
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
        to="/library"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        返回工具库
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <Card.Body className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {tool.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-bold text-gray-900">{tool.name}</h1>
                      {!tool.isLinkValid && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-lg">
                          <AlertTriangle className="w-3 h-3" />
                          链接失效
                        </span>
                      )}
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-lg', PRICE_COLORS[tool.price])}>
                        {PRICE_LABELS[tool.price]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Rating value={tool.rating} size="sm" readonly />
                        <span className="text-sm text-gray-500 ml-1">
                          {tool.rating} ({tool.reviewCount} 条评价)
                        </span>
                      </div>
                      {categoryInfo && (
                        <span className="text-sm text-gray-500">
                          {categoryInfo.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCheckLink}
                    disabled={isCheckingLink}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="检测链接"
                  >
                    <RefreshCw className={cn('w-4 h-4 text-gray-500', isCheckingLink && 'animate-spin')} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="分享"
                  >
                    <Share2 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">{tool.description}</p>

              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag, idx) => (
                  <TagBadge
                    key={tag}
                    label={tag}
                    color={tagColors[idx % tagColors.length]}
                  />
                ))}
                {tool.tags.length === 0 && (
                  <span className="text-sm text-gray-400">暂无标签</span>
                )}
              </div>

              {tool.priceInfo && (
                <div className="p-4 bg-amber-50 rounded-xl">
                  <h3 className="font-medium text-amber-900 mb-1">价格说明</h3>
                  <p className="text-sm text-amber-700">{tool.priceInfo}</p>
                </div>
              )}

              {tool.limitations && tool.limitations.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-medium text-gray-900 mb-2">使用限制</h3>
                  <ul className="space-y-1">
                    {tool.limitations.map((limitation, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-gray-400 mt-1">•</span>
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={handleVisit}
                  leftIcon={<ExternalLink className="w-5 h-5" />}
                >
                  立即访问
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleCompare}
                  leftIcon={<GitCompare className="w-5 h-5" />}
                  className={isInCompare ? 'bg-brand-100 text-brand-700' : ''}
                >
                  {isInCompare ? '已添加对比' : '添加对比'}
                </Button>
                <CollectionSelector
                  toolId={tool.id}
                  trigger={
                    <Button
                      size="lg"
                      variant="outline"
                      leftIcon={<BookmarkPlus className="w-5 h-5" />}
                      onClick={(e) => e.preventDefault()}
                    >
                      收藏
                    </Button>
                  }
                />
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-gray-100 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  添加于 {formatDate(tool.createdAt)}
                </span>
                {tool.lastUsedAt && (
                  <span>最近使用 {formatDate(tool.lastUsedAt)}</span>
                )}
              </div>
            </Card.Body>
          </Card>

          {tool.screenshots.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">截图预览</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tool.screenshots.map((screenshot, idx) => (
                  <button
                    key={screenshot.id}
                    onClick={() => openScreenshotViewer(tool.id, idx)}
                    className="group relative aspect-video rounded-xl overflow-hidden bg-gray-100"
                  >
                    <img
                      src={screenshot.url}
                      alt={screenshot.caption || `Screenshot ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white/90 rounded-full">
                        <ZoomIn className="w-5 h-5 text-gray-700" />
                      </div>
                    </div>
                    {screenshot.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                        <p className="text-white text-sm">{screenshot.caption}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tool.alternatives && tool.alternatives.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">替代工具</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tool.alternatives.map((altId) => {
                  const altTool = getToolById(altId);
                  if (!altTool) return null;
                  return (
                    <Link
                      key={altId}
                      to={`/tool/${altId}`}
                      className="group"
                    >
                      <Card hoverable>
                        <Card.Body className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-cyan-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {altTool.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 group-hover:text-brand-600 transition-colors truncate">
                              {altTool.name}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {altTool.description}
                            </p>
                          </div>
                          <Rating value={altTool.rating} size="sm" readonly />
                        </Card.Body>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">用户评价</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReviewModal(true)}
                leftIcon={<Star className="w-4 h-4" />}
              >
                写评价
              </Button>
            </div>
            {reviews.length === 0 ? (
              <div className="max-w-md mx-auto py-8">
                <Empty
                  icon="star"
                  title="还没有评价"
                  description="成为第一个评价这个工具的人吧"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <Card.Body>
                      <div className="flex items-center justify-between mb-2">
                        <Rating value={review.rating} size="sm" readonly showValue />
                        <span className="text-sm text-gray-400">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600">{review.comment}</p>
                      )}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <Card.Body>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">使用笔记</h3>
                <button
                  onClick={() => {
                    setEditingNote(null);
                    setNewNote('');
                    setShowNoteModal(true);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="添加笔记"
                >
                  <Plus className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              {notes.length === 0 ? (
                <div className="py-8 text-center">
                  <Edit3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">还没有笔记</p>
                  <p className="text-xs text-gray-400 mt-1">记录你的使用心得</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
                  {notes.map((note) => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-xl group">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-400">
                          {formatDate(note.updatedAt)}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditNote(note)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="编辑"
                          >
                            <Edit3 className="w-3 h-3 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h3 className="font-semibold text-gray-900 mb-4">工具信息</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">分类</span>
                  <span className="text-gray-900">{categoryInfo?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">评分</span>
                  <span className="text-gray-900">{tool.rating} / 5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">评价数</span>
                  <span className="text-gray-900">{tool.reviewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">链接状态</span>
                  <span className={tool.isLinkValid ? 'text-emerald-600' : 'text-red-600'}>
                    {tool.isLinkValid ? '正常' : '失效'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">添加时间</span>
                  <span className="text-gray-900">{formatDate(tool.createdAt)}</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {isInCompare && (
            <Link to="/compare">
              <Button className="w-full" leftIcon={<GitCompare className="w-4 h-4" />}>
                查看对比 ({compareList.length}/4)
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="评价工具"
        size="sm"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-3">请为这个工具打分</p>
            <Rating
              value={newRating}
              size="lg"
              onChange={setNewRating}
              showValue
            />
          </div>
          <TextArea
            label="评价内容（可选）"
            placeholder="分享你的使用体验..."
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            rows={4}
          />
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowReviewModal(false)}
              leftIcon={<X className="w-4 h-4" />}
            >
              取消
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSubmitReview}
              leftIcon={<Check className="w-4 h-4" />}
            >
              提交
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          setEditingNote(null);
          setNewNote('');
        }}
        title={editingNote ? '编辑笔记' : '添加笔记'}
        size="sm"
      >
        <div className="space-y-6">
          <TextArea
            label="笔记内容"
            placeholder="记录你的使用心得、技巧、快捷键等..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={6}
            autoFocus
          />
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setShowNoteModal(false);
                setEditingNote(null);
                setNewNote('');
              }}
              leftIcon={<X className="w-4 h-4" />}
            >
              取消
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSubmitNote}
              leftIcon={<Check className="w-4 h-4" />}
            >
              保存
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
