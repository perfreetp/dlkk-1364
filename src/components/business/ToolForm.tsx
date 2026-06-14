import React, { useState, useRef, useMemo, useEffect } from 'react';
import { X, Upload, Link2, Tag, AlertCircle, Image, Search, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input, TextArea, Select } from '@/components/common/Input';
import { TagBadge } from '@/components/common/TagBadge';
import { Modal } from '@/components/common/Modal';
import { CATEGORIES, type Tool } from '@/types';
import { useToolStore } from '@/store/useToolStore';
import { useCollectionStore } from '@/store/useCollectionStore';
import { useUIStore } from '@/store/useUIStore';
import { generateId } from '@/utils/idGenerator';

interface ToolFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<Tool>;
}

export const ToolForm: React.FC<ToolFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    url: initialData?.url || '',
    description: initialData?.description || '',
    category: initialData?.category || 'other',
    price: initialData?.price || 'free' as Tool['price'],
    priceInfo: initialData?.priceInfo || '',
    limitations: initialData?.limitations?.join('\n') || '',
    tags: initialData?.tags || [] as string[],
    screenshots: initialData?.screenshots || [],
    alternatives: initialData?.alternatives || [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [screenshotUploading, setScreenshotUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addTool = useToolStore((state) => state.addTool);
  const updateTool = useToolStore((state) => state.updateTool);
  const checkForDuplicate = useToolStore((state) => state.checkForDuplicate);
  const getAllTags = useCollectionStore((state) => state.getAllTags);
  const showToast = useUIStore((state) => state.showToast);
  const tools = useToolStore((state) => state.tools);

  const allTags = getAllTags();

  const [altSearchQuery, setAltSearchQuery] = useState('');
  const [altDropdownOpen, setAltDropdownOpen] = useState(false);
  const altDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (altDropdownRef.current && !altDropdownRef.current.contains(e.target as Node)) {
        setAltDropdownOpen(false);
      }
    };
    if (altDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [altDropdownOpen]);

  const alternativeTools = useMemo(() => {
    const currentId = initialData?.id;
    const filtered = tools.filter((t) => t.id !== currentId);
    if (!altSearchQuery.trim()) return filtered.slice(0, 50);
    const q = altSearchQuery.toLowerCase();
    return filtered
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
      .slice(0, 50);
  }, [tools, altSearchQuery, initialData?.id]);

  const selectedAltNames = useMemo(() => {
    return formData.alternatives
      .map((id) => tools.find((t) => t.id === id)?.name)
      .filter(Boolean) as string[];
  }, [formData.alternatives, tools]);

  const handleToggleAlternative = (toolId: string) => {
    setFormData((prev) => {
      const exists = prev.alternatives.includes(toolId);
      return {
        ...prev,
        alternatives: exists
          ? prev.alternatives.filter((id) => id !== toolId)
          : [...prev.alternatives, toolId],
      };
    });
  };

  const handleRemoveAlternative = (toolId: string) => {
    setFormData((prev) => ({
      ...prev,
      alternatives: prev.alternatives.filter((id) => id !== toolId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('请输入工具名称');
      return;
    }
    if (!formData.url.trim()) {
      setError('请输入工具链接');
      return;
    }
    if (!formData.url.startsWith('http')) {
      setError('请输入有效的网址（以 http:// 或 https:// 开头）');
      return;
    }

    setLoading(true);

    const limitations = formData.limitations
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (initialData?.id) {
      updateTool(initialData.id, {
        name: formData.name.trim(),
        url: formData.url.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags,
        price: formData.price,
        priceInfo: formData.priceInfo.trim() || undefined,
        limitations: limitations.length > 0 ? limitations : undefined,
        screenshots: formData.screenshots,
        alternatives: formData.alternatives,
      });
      setLoading(false);
      showToast(`${formData.name} 修改成功！`, 'success');
      handleReset();
      onSuccess?.();
      onClose?.();
    } else {
      const result = await addTool({
        name: formData.name.trim(),
        url: formData.url.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags,
        price: formData.price,
        priceInfo: formData.priceInfo.trim() || undefined,
        limitations: limitations.length > 0 ? limitations : undefined,
        screenshots: formData.screenshots,
        alternatives: formData.alternatives,
      });

      setLoading(false);

      if (result.success) {
        showToast(`${formData.name} 添加成功！`, 'success');
        handleReset();
        onSuccess?.();
        onClose?.();
      } else if (result.duplicate) {
        showToast(`该链接已收藏：${result.tool?.name}`, 'error');
      } else {
        showToast('添加失败，请重试', 'error');
      }
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      url: '',
      description: '',
      category: 'other',
      price: 'free',
      priceInfo: '',
      limitations: '',
      tags: [],
      screenshots: [],
      alternatives: [],
    });
    setTagInput('');
    setScreenshotUrl('');
    setError('');
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleAddScreenshot = () => {
    const url = screenshotUrl.trim();
    if (url) {
      setFormData((prev) => ({
        ...prev,
        screenshots: [
          ...prev.screenshots,
          {
            id: generateId(),
            url,
            uploadedAt: Date.now(),
          },
        ],
      }));
      setScreenshotUrl('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setScreenshotUploading(true);
    
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024;

    Array.from(files).forEach((file) => {
      if (!validTypes.includes(file.type)) {
        showToast(`${file.name} 格式不支持，请上传 PNG/JPG/WebP/GIF 图片`, 'error');
        return;
      }
      if (file.size > maxSize) {
        showToast(`${file.name} 超过5MB限制`, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setFormData((prev) => ({
            ...prev,
            screenshots: [
              ...prev.screenshots,
              {
                id: generateId(),
                url: dataUrl,
                uploadedAt: Date.now(),
              },
            ],
          }));
        }
      };
      reader.onerror = () => {
        showToast(`${file.name} 读取失败`, 'error');
      };
      reader.readAsDataURL(file);
    });

    setScreenshotUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveScreenshot = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((s) => s.id !== id),
    }));
  };

  const handleCheckDuplicate = () => {
    const duplicate = checkForDuplicate(formData.url);
    if (duplicate) {
      setError(`该链接已收藏：${duplicate.name}`);
    } else {
      showToast('未检测到重复链接', 'success');
    }
  };

  const tagColors = ['blue', 'green', 'amber', 'purple', 'cyan', 'pink'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? '编辑工具' : '添加新工具'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={() => { onCancel?.(); onClose?.(); }} disabled={loading}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {initialData ? '保存修改' : '添加工具'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="工具名称 *"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="例如：Figma"
          />
          <div className="relative">
            <Input
              label="工具链接 *"
              value={formData.url}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, url: e.target.value }));
                setError('');
              }}
              placeholder="https://example.com"
              icon={<Link2 className="w-4 h-4" />}
            />
            {formData.url && (
              <button
                type="button"
                onClick={handleCheckDuplicate}
                className="absolute right-2 top-8 text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                检测重复
              </button>
            )}
          </div>
        </div>

        <TextArea
          label="工具描述"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="简要介绍这个工具的用途和特点..."
          rows={3}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="分类"
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            options={CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({
              value: c.id,
              label: c.name,
            }))}
          />
          <Select
            label="价格类型"
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value as Tool['price'] }))}
            options={[
              { value: 'free', label: '免费' },
              { value: 'freemium', label: '免费增值' },
              { value: 'paid', label: '付费' },
            ]}
          />
          <Input
            label="价格说明"
            value={formData.priceInfo}
            onChange={(e) => setFormData((prev) => ({ ...prev, priceInfo: e.target.value }))}
            placeholder="例如：$12/月"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            标签
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, idx) => (
              <TagBadge
                key={tag}
                label={tag}
                color={tagColors[idx % tagColors.length]}
                removable
                onRemove={() => handleRemoveTag(tag)}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="输入标签后按回车添加"
              icon={<Tag className="w-4 h-4" />}
            />
            {allTags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {allTags.slice(0, 5).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (!formData.tags.includes(tag)) {
                        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
                      }
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            使用限制（每行一个）
          </label>
          <textarea
            value={formData.limitations}
            onChange={(e) => setFormData((prev) => ({ ...prev, limitations: e.target.value }))}
            placeholder="例如：&#10;免费版每月限100次调用&#10;不支持中文"
            rows={3}
            className="w-full px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            截图
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {formData.screenshots.map((ss) => (
              <div key={ss.id} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img src={ss.url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveScreenshot(ss.id)}
                  className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-brand-500 hover:bg-brand-50 flex flex-col items-center justify-center text-gray-500 hover:text-brand-600 transition-colors"
            >
              {screenshotUploading ? (
                <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
              ) : (
                <>
                  <Image className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">上传图片</span>
                </>
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="flex gap-2">
            <Input
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddScreenshot();
                }
              }}
              placeholder="或粘贴图片链接后按回车添加"
              icon={<Link2 className="w-4 h-4" />}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddScreenshot}
              disabled={!screenshotUrl.trim()}
            >
              添加
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            支持 PNG/JPG/WebP/GIF 格式，单张图片不超过 5MB
          </p>
        </div>

        <div ref={altDropdownRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            替代工具
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.alternatives.map((altId) => {
              const altTool = tools.find((t) => t.id === altId);
              if (!altTool) return null;
              return (
                <span
                  key={altId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium"
                >
                  {altTool.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveAlternative(altId)}
                    className="ml-0.5 p-0.5 rounded hover:bg-brand-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              );
            })}
          </div>
          <div className="relative">
            <div
              onClick={() => setAltDropdownOpen((o) => !o)}
              className="w-full px-4 py-2.5 pr-10 text-sm bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={altSearchQuery}
                onChange={(e) => {
                  setAltSearchQuery(e.target.value);
                  setAltDropdownOpen(true);
                }}
                onFocus={() => setAltDropdownOpen(true)}
                onClick={(e) => e.stopPropagation()}
                placeholder="搜索已收藏的工具..."
                className="flex-1 outline-none bg-transparent min-w-0"
              />
              <ChevronDown
                className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${altDropdownOpen ? 'rotate-180' : ''}`}
              />
            </div>
            {altDropdownOpen && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                {alternativeTools.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    没有找到匹配的工具
                  </div>
                ) : (
                  alternativeTools.map((tool) => {
                    const isSelected = formData.alternatives.includes(tool.id);
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => handleToggleAlternative(tool.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-brand-600 border-brand-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {tool.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate line-clamp-1">
                            {tool.description}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            选择功能类似或互为替代的工具，便于对比参考
          </p>
        </div>
      </form>
    </Modal>
  );
};
