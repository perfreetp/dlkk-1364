import React, { useState } from 'react';
import { X, Upload, Link2, Tag, AlertCircle } from 'lucide-react';
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

  const addTool = useToolStore((state) => state.addTool);
  const checkForDuplicate = useToolStore((state) => state.checkForDuplicate);
  const getAllTags = useCollectionStore((state) => state.getAllTags);
  const showToast = useUIStore((state) => state.showToast);

  const allTags = getAllTags();

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
          <div className="grid grid-cols-3 gap-3 mb-2">
            {formData.screenshots.map((ss) => (
              <div key={ss.id} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
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
          </div>
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
              placeholder="粘贴截图链接后按回车添加"
              icon={<Upload className="w-4 h-4" />}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
