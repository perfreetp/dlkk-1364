import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Folder,
  FileText,
  Clock,
  Download,
  Upload,
  Settings,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  Share2,
  DownloadCloud,
  Bell,
  Check,
  X,
  Bookmark,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { TagBadge } from '@/components/common/TagBadge';
import { Empty } from '@/components/Empty';
import { Modal } from '@/components/common/Modal';
import { Input, TextArea } from '@/components/common/Input';
import { useToolStore } from '@/store/useToolStore';
import { useCollectionStore } from '@/store/useCollectionStore';
import { useUIStore } from '@/store/useUIStore';
import { CATEGORIES, PRICE_COLORS, PRICE_LABELS } from '@/types';
import type { Collection } from '@/types';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'collections', label: '我的收藏夹', icon: Folder },
  { id: 'notes', label: '使用笔记', icon: FileText },
  { id: 'recent', label: '最近使用', icon: Clock },
  { id: 'reminders', label: '系统提醒', icon: Bell },
  { id: 'import-export', label: '导入导出', icon: Download },
  { id: 'settings', label: '偏好设置', icon: Settings },
];

export default function Profile() {
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [newCollectionPublic, setNewCollectionPublic] = useState(false);
  const [activeTab, setActiveTab] = useState('collections');
  const [importFormat, setImportFormat] = useState<'json' | 'html'>('html');
  const [isImporting, setIsImporting] = useState(false);

  const tools = useToolStore((state) => state.tools);
  const notes = useToolStore((state) => state.notes);
  const reminders = useToolStore((state) => state.reminders);
  const getRecentTools = useToolStore((state) => state.getRecentTools);
  const getToolById = useToolStore((state) => state.getToolById);
  const deleteTool = useToolStore((state) => state.deleteTool);
  const markReminderAsRead = useToolStore((state) => state.markReminderAsRead);
  const markAllRemindersAsRead = useToolStore((state) => state.markAllRemindersAsRead);
  const clearReminder = useToolStore((state) => state.clearReminder);
  const deleteNote = useToolStore((state) => state.deleteNote);

  const collections = useCollectionStore((state) => state.collections);
  const addCollection = useCollectionStore((state) => state.addCollection);
  const updateCollection = useCollectionStore((state) => state.updateCollection);
  const deleteCollection = useCollectionStore((state) => state.deleteCollection);
  const removeToolFromCollection = useCollectionStore((state) => state.removeToolFromCollection);
  const shareCollection = useCollectionStore((state) => state.shareCollection);
  const shareCollectionAsLink = useCollectionStore((state) => state.shareCollectionAsLink);
  const exportAll = useCollectionStore((state) => state.exportAll);
  const importTools = useCollectionStore((state) => state.importTools);

  const openBookmarkImportModal = useUIStore((state) => state.openBookmarkImportModal);
  const showToast = useUIStore((state) => state.showToast);

  const recentTools = getRecentTools(20);
  const unreadCount = reminders.filter((r) => !r.isRead).length;

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      showToast('请输入收藏夹名称', 'error');
      return;
    }

    if (editingCollection) {
      updateCollection(editingCollection.id, {
        name: newCollectionName.trim(),
        description: newCollectionDesc.trim(),
        isPublic: newCollectionPublic,
      });
      showToast('收藏夹已更新', 'success');
    } else {
      addCollection({
        name: newCollectionName.trim(),
        description: newCollectionDesc.trim(),
        isPublic: newCollectionPublic,
      });
      showToast('收藏夹已创建', 'success');
    }

    setShowNewCollectionModal(false);
    setEditingCollection(null);
    setNewCollectionName('');
    setNewCollectionDesc('');
    setNewCollectionPublic(false);
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setNewCollectionName(collection.name);
    setNewCollectionDesc(collection.description);
    setNewCollectionPublic(collection.isPublic);
    setShowNewCollectionModal(true);
  };

  const handleDeleteCollection = (collectionId: string) => {
    if (confirm('确定要删除这个收藏夹吗？收藏夹内的工具不会被删除。')) {
      deleteCollection(collectionId);
      showToast('收藏夹已删除', 'info');
    }
  };

  const handleRemoveToolFromCollection = (collectionId: string, toolId: string) => {
    removeToolFromCollection(collectionId, toolId);
    showToast('已从收藏夹移除', 'info');
  };

  const handleShareCollection = async (collectionId: string) => {
    const result = await shareCollectionAsLink(collectionId);
    if (result.success) {
      showToast('分享链接已复制到剪贴板', 'success');
    } else {
      showToast('分享失败', 'error');
    }
  };

  const handleExport = (format: 'json' | 'html') => {
    exportAll(format);
    showToast('导出成功', 'success');
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      let toolsToImport: Array<{ name: string; url: string; description?: string; folder?: string }> = [];

      if (importFormat === 'json') {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          toolsToImport = data.map((t) => ({
            name: t.name,
            url: t.url,
            description: t.description,
          }));
        } else if (data.tools) {
          toolsToImport = data.tools.map((t: any) => ({
            name: t.name,
            url: t.url,
            description: t.description,
          }));
        }
      } else {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const links = doc.querySelectorAll('a');
        links.forEach((link) => {
          const parent = link.parentElement;
          let folder = '';
          if (parent) {
            const h3 = parent.querySelector('h3');
            if (h3) folder = h3.textContent || '';
          }
          toolsToImport.push({
            name: link.textContent || link.getAttribute('href') || '',
            url: link.getAttribute('href') || '',
            description: link.getAttribute('description') || undefined,
            folder,
          });
        });
      }

      const importedCount = await importTools(toolsToImport);
      showToast(`成功导入 ${importedCount} 个工具`, 'success');
    } catch (error) {
      showToast('导入失败，请检查文件格式', 'error');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const tagColors = ['blue', 'green', 'amber', 'purple', 'cyan', 'pink'];

  const stats = [
    { label: '收藏工具', value: tools.length, icon: Bookmark },
    { label: '收藏夹', value: collections.length, icon: Folder },
    { label: '笔记', value: notes.length, icon: FileText },
    { label: '待处理', value: unreadCount, icon: Bell, highlight: unreadCount > 0 },
  ];

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-brand-500 to-cyan-500 text-white border-0">
        <Card.Body className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <User className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">我的工具收藏夹</h1>
            <p className="text-white/80 mt-1">管理你的在线工具资产</p>
          </div>
          <div className="hidden md:flex gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={cn(
                  'text-3xl font-bold',
                  stat.highlight && 'text-amber-200'
                )}>
                  {stat.value}
                </div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-56 flex-shrink-0">
          <nav className="space-y-1 sticky top-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors',
                  activeTab === tab.id
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.id === 'reminders' && unreadCount > 0 && (
                  <span className="ml-auto w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === 'collections' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">我的收藏夹</h2>
                <Button
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    setEditingCollection(null);
                    setNewCollectionName('');
                    setNewCollectionDesc('');
                    setNewCollectionPublic(false);
                    setShowNewCollectionModal(true);
                  }}
                >
                  新建收藏夹
                </Button>
              </div>

              {collections.length === 0 ? (
                <div className="max-w-md mx-auto py-12">
                  <Empty
                    icon="folder"
                    title="还没有收藏夹"
                    description="创建收藏夹，按场景整理你的工具"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {collections.map((collection) => (
                    <Card key={collection.id}>
                      <Card.Body>
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
                              {collection.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">
                                  {collection.name}
                                </h3>
                                {collection.isPublic && (
                                  <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                                    公开
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {collection.description || '暂无描述'}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {collection.toolIds.length} 个工具 · 更新于 {formatDate(collection.updatedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleShareCollection(collection.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="分享"
                            >
                              <Share2 className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleEditCollection(collection)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="编辑"
                            >
                              <Edit3 className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDeleteCollection(collection.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>

                        {collection.toolIds.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {collection.toolIds.slice(0, 6).map((toolId) => {
                              const tool = getToolById(toolId);
                              if (!tool) return null;
                              return (
                                <div
                                  key={toolId}
                                  className="group flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg"
                                >
                                  <Link
                                    to={`/tool/${tool.id}`}
                                    className="text-sm text-gray-700 hover:text-brand-600 transition-colors"
                                  >
                                    {tool.name}
                                  </Link>
                                  <button
                                    onClick={() => handleRemoveToolFromCollection(collection.id, toolId)}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 rounded transition-all"
                                    title="移除"
                                  >
                                    <X className="w-3 h-3 text-red-500" />
                                  </button>
                                </div>
                              );
                            })}
                            {collection.toolIds.length > 6 && (
                              <Link
                                to={`/collection/${collection.id}`}
                                className="px-3 py-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
                              >
                                +{collection.toolIds.length - 6} 个更多
                              </Link>
                            )}
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <Link
                            to={`/collection/${collection.id}`}
                            className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
                          >
                            查看详情
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">使用笔记</h2>
              {notes.length === 0 ? (
                <div className="max-w-md mx-auto py-12">
                  <Empty
                    icon="note"
                    title="还没有笔记"
                    description="在工具详情页记录你的使用心得"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => {
                    const tool = getToolById(note.toolId);
                    return (
                      <Card key={note.id}>
                        <Card.Body>
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                                {tool?.name.charAt(0) || '?'}
                              </div>
                              <div>
                                {tool ? (
                                  <Link
                                    to={`/tool/${tool.id}`}
                                    className="font-medium text-gray-900 hover:text-brand-600 transition-colors"
                                  >
                                    {tool.name}
                                  </Link>
                                ) : (
                                  <span className="font-medium text-gray-400">工具已删除</span>
                                )}
                                <p className="text-xs text-gray-400 mt-0.5">
                                  更新于 {formatDate(note.updatedAt)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                deleteNote(note.id);
                                showToast('笔记已删除', 'info');
                              }}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                          <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
                        </Card.Body>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">最近使用</h2>
              {recentTools.length === 0 ? (
                <div className="max-w-md mx-auto py-12">
                  <Empty
                    icon="clock"
                    title="暂无使用记录"
                    description="开始使用工具后会在这里显示"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTools.map((tool) => (
                    <Card key={tool.id}>
                      <Card.Body className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {tool.screenshots[0] ? (
                            <img
                              src={tool.screenshots[0].url}
                              alt={tool.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-400 to-cyan-400">
                              <span className="text-xl font-bold text-white">
                                {tool.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/tool/${tool.id}`}
                            className="font-medium text-gray-900 hover:text-brand-600 transition-colors"
                          >
                            {tool.name}
                          </Link>
                          <p className="text-sm text-gray-500 line-clamp-1">{tool.description}</p>
                        </div>
                        <span className={cn('px-2.5 py-1 text-xs font-medium rounded-lg flex-shrink-0', PRICE_COLORS[tool.price])}>
                          {PRICE_LABELS[tool.price]}
                        </span>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reminders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">系统提醒</h2>
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllRemindersAsRead}
                  >
                    全部已读
                  </Button>
                )}
              </div>
              {reminders.length === 0 ? (
                <div className="max-w-md mx-auto py-12">
                  <Empty
                    icon="bell"
                    title="暂无提醒"
                    description="有新的提醒会在这里显示"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {reminders.map((reminder) => {
                    const tool = getToolById(reminder.toolId);
                    return (
                      <Card
                        key={reminder.id}
                        className={cn(
                          'transition-colors',
                          !reminder.isRead && 'bg-brand-50/50'
                        )}
                      >
                        <Card.Body className="flex items-start gap-4">
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                            reminder.type === 'broken-link' && 'bg-red-100 text-red-600',
                            reminder.type === 'duplicate' && 'bg-amber-100 text-amber-600',
                            reminder.type === 'update' && 'bg-blue-100 text-blue-600'
                          )}>
                            {reminder.type === 'broken-link' && <AlertTriangle className="w-5 h-5" />}
                            {reminder.type === 'duplicate' && <AlertTriangle className="w-5 h-5" />}
                            {reminder.type === 'update' && <Bell className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-gray-900',
                              !reminder.isRead && 'font-medium'
                            )}>
                              {reminder.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(reminder.createdAt)}
                            </p>
                            {tool && (
                              <Link
                                to={`/tool/${tool.id}`}
                                className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 mt-2"
                              >
                                查看工具
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {!reminder.isRead && (
                              <button
                                onClick={() => markReminderAsRead(reminder.id)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="标记已读"
                              >
                                <Check className="w-4 h-4 text-gray-500" />
                              </button>
                            )}
                            <button
                              onClick={() => clearReminder(reminder.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="清除"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </Card.Body>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'import-export' && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold text-gray-900">导入导出</h2>

              <Card>
                <Card.Header>
                  <h3 className="font-semibold text-gray-900">导入数据</h3>
                </Card.Header>
                <Card.Body className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-4">
                      支持从浏览器书签或 JSON 备份文件导入工具
                    </p>
                    <div className="flex gap-4 mb-4">
                      <label className="flex-1">
                        <input
                          type="radio"
                          name="importFormat"
                          value="html"
                          checked={importFormat === 'html'}
                          onChange={() => setImportFormat('html')}
                          className="sr-only"
                        />
                        <div className={cn(
                          'p-4 border-2 rounded-xl cursor-pointer transition-all',
                          importFormat === 'html'
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}>
                          <div className="font-medium text-gray-900">浏览器书签</div>
                          <div className="text-sm text-gray-500 mt-1">
                            支持 Chrome、Edge、Firefox 等浏览器导出的 HTML 书签文件
                          </div>
                        </div>
                      </label>
                      <label className="flex-1">
                        <input
                          type="radio"
                          name="importFormat"
                          value="json"
                          checked={importFormat === 'json'}
                          onChange={() => setImportFormat('json')}
                          className="sr-only"
                        />
                        <div className={cn(
                          'p-4 border-2 rounded-xl cursor-pointer transition-all',
                          importFormat === 'json'
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}>
                          <div className="font-medium text-gray-900">JSON 备份</div>
                          <div className="text-sm text-gray-500 mt-1">
                            从本应用导出的 JSON 备份文件恢复数据
                          </div>
                        </div>
                      </label>
                    </div>
                    <div className="flex gap-4">
                      <Button
                        onClick={openBookmarkImportModal}
                        leftIcon={<Upload className="w-4 h-4" />}
                        variant="secondary"
                      >
                        书签向导导入
                      </Button>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept={importFormat === 'html' ? '.html' : '.json'}
                          onChange={handleFileImport}
                          className="hidden"
                          disabled={isImporting}
                        />
                        <Button
                          leftIcon={<Upload className="w-4 h-4" />}
                          disabled={isImporting}
                          className={isImporting ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                          {isImporting ? '导入中...' : '选择文件导入'}
                        </Button>
                      </label>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header>
                  <h3 className="font-semibold text-gray-900">导出数据</h3>
                </Card.Header>
                <Card.Body className="space-y-4">
                  <p className="text-sm text-gray-500">
                    导出你的工具收藏数据，支持备份或分享给他人
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button
                      variant="secondary"
                      onClick={() => handleExport('json')}
                      leftIcon={<DownloadCloud className="w-4 h-4" />}
                    >
                      导出 JSON 备份
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleExport('html')}
                      leftIcon={<DownloadCloud className="w-4 h-4" />}
                    >
                      导出 HTML 书签
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">偏好设置</h2>
              <Card>
                <Card.Header>
                  <h3 className="font-semibold text-gray-900">数据管理</h3>
                </Card.Header>
                <Card.Body className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">清除所有数据</div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        清除本地存储的所有工具、收藏夹、笔记等数据
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      onClick={() => {
                        if (confirm('确定要清除所有数据吗？此操作不可撤销。')) {
                          localStorage.clear();
                          window.location.reload();
                        }
                      }}
                    >
                      清除数据
                    </Button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-medium text-gray-900">当前数据统计</div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        工具：{tools.length} · 收藏夹：{collections.length} · 笔记：{notes.length}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header>
                  <h3 className="font-semibold text-gray-900">关于</h3>
                </Card.Header>
                <Card.Body>
                  <p className="text-gray-600">
                    工具收藏夹 - 帮你整理零散的在线工具网址，让每一款工具都随时可用。
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    所有数据保存在本地浏览器中，不会上传到服务器。
                  </p>
                </Card.Body>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showNewCollectionModal}
        onClose={() => {
          setShowNewCollectionModal(false);
          setEditingCollection(null);
          setNewCollectionName('');
          setNewCollectionDesc('');
          setNewCollectionPublic(false);
        }}
        title={editingCollection ? '编辑收藏夹' : '新建收藏夹'}
        size="sm"
      >
        <div className="space-y-6">
          <Input
            label="收藏夹名称"
            placeholder="例如：UI 设计工具集"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            autoFocus
          />
          <TextArea
            label="描述（可选）"
            placeholder="简单描述这个收藏夹的用途"
            value={newCollectionDesc}
            onChange={(e) => setNewCollectionDesc(e.target.value)}
            rows={3}
          />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={newCollectionPublic}
              onChange={(e) => setNewCollectionPublic(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              设为公开收藏夹（可生成分享链接）
            </label>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setShowNewCollectionModal(false);
                setEditingCollection(null);
                setNewCollectionName('');
                setNewCollectionDesc('');
                setNewCollectionPublic(false);
              }}
              leftIcon={<X className="w-4 h-4" />}
            >
              取消
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleCreateCollection}
              leftIcon={<Check className="w-4 h-4" />}
            >
              {editingCollection ? '保存' : '创建'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
