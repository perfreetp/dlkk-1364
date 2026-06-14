import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GitCompare,
  X,
  Plus,
  Download,
  Share2,
  ChevronLeft,
  Star,
  Check,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Rating } from '@/components/common/Rating';
import { TagBadge } from '@/components/common/TagBadge';
import { ToolCard } from '@/components/business/ToolCard';
import { Empty } from '@/components/Empty';
import { Modal } from '@/components/common/Modal';
import { useToolStore } from '@/store/useToolStore';
import { useUIStore } from '@/store/useUIStore';
import { CATEGORIES, PRICE_COLORS, PRICE_LABELS } from '@/types';
import type { Tool } from '@/types';
import { cn } from '@/lib/utils';

export default function Compare() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const compareList = useToolStore((state) => state.compareList);
  const tools = useToolStore((state) => state.tools);
  const getToolById = useToolStore((state) => state.getToolById);
  const removeFromCompare = useToolStore((state) => state.removeFromCompare);
  const clearCompareList = useToolStore((state) => state.clearCompareList);
  const addToCompare = useToolStore((state) => state.addToCompare);
  const markAsUsed = useToolStore((state) => state.markAsUsed);
  const showToast = useUIStore((state) => state.showToast);

  const compareTools = compareList
    .map((id) => getToolById(id))
    .filter((t): t is Tool => t !== undefined);

  const availableTools = tools.filter(
    (t) => !compareList.includes(t.id) && t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTool = (toolId: string) => {
    const success = addToCompare(toolId);
    if (success) {
      showToast('已添加到对比列表', 'success');
    } else {
      showToast('对比列表最多支持4个工具', 'error');
    }
  };

  const handleRemoveTool = (toolId: string) => {
    removeFromCompare(toolId);
    showToast('已从对比列表移除', 'info');
  };

  const handleVisit = (tool: Tool) => {
    markAsUsed(tool.id);
    window.open(tool.url, '_blank', 'noopener,noreferrer');
    showToast(`已打开 ${tool.name}`, 'success');
  };

  const handleExport = () => {
    if (compareTools.length === 0) return;

    const content = generateCompareReport();
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `工具对比报告_${new Date().toLocaleDateString('zh-CN')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('对比报告已导出', 'success');
  };

  const handleShare = async () => {
    if (compareTools.length === 0) return;

    const content = generateCompareReport();
    try {
      await navigator.clipboard.writeText(content);
      showToast('对比内容已复制到剪贴板', 'success');
    } catch {
      showToast('复制失败，请手动复制', 'error');
    }
  };

  const generateCompareReport = () => {
    let report = `# 工具对比报告\n\n`;
    report += `生成时间：${new Date().toLocaleString('zh-CN')}\n\n`;
    report += `## 对比工具列表\n\n`;
    compareTools.forEach((tool, idx) => {
      report += `${idx + 1}. **${tool.name}** - ${tool.description}\n`;
    });
    report += `\n## 详细对比\n\n`;
    report += `| 特性 | ${compareTools.map((t) => t.name).join(' | ')} |\n`;
    report += `| --- | ${compareTools.map(() => '---').join(' | ')} |\n`;
    report += `| 分类 | ${compareTools.map((t) => CATEGORIES.find((c) => c.id === t.category)?.name || '-').join(' | ')} |\n`;
    report += `| 评分 | ${compareTools.map((t) => `${t.rating} / 5 (${t.reviewCount}条评价)`).join(' | ')} |\n`;
    report += `| 价格 | ${compareTools.map((t) => PRICE_LABELS[t.price]).join(' | ')} |\n`;
    report += `| 链接状态 | ${compareTools.map((t) => t.isLinkValid ? '✅ 正常' : '❌ 失效').join(' | ')} |\n`;
    report += `| 标签 | ${compareTools.map((t) => t.tags.join(', ') || '-').join(' | ')} |\n`;
    report += `\n## 工具详情\n\n`;
    compareTools.forEach((tool) => {
      report += `### ${tool.name}\n\n`;
      report += `- 描述：${tool.description}\n`;
      report += `- 链接：${tool.url}\n`;
      report += `- 分类：${CATEGORIES.find((c) => c.id === tool.category)?.name || '-'}\n`;
      report += `- 评分：${tool.rating} / 5 (${tool.reviewCount}条评价)\n`;
      report += `- 价格：${PRICE_LABELS[tool.price]}\n`;
      if (tool.priceInfo) report += `- 价格说明：${tool.priceInfo}\n`;
      if (tool.limitations && tool.limitations.length > 0) {
        report += `- 使用限制：\n`;
        tool.limitations.forEach((lim) => report += `  - ${lim}\n`);
      }
      report += `\n`;
    });
    report += `\n---\n*本报告由工具收藏夹自动生成*`;
    return report;
  };

  const tagColors = ['blue', 'green', 'amber', 'purple', 'cyan', 'pink'];
  const compareFields = [
    { key: 'category', label: '分类' },
    { key: 'rating', label: '评分' },
    { key: 'price', label: '价格' },
    { key: 'priceInfo', label: '价格说明' },
    { key: 'limitations', label: '使用限制' },
    { key: 'tags', label: '标签' },
    { key: 'isLinkValid', label: '链接状态' },
    { key: 'createdAt', label: '添加时间' },
  ];

  const renderFieldValue = (tool: Tool, field: string) => {
    switch (field) {
      case 'category':
        return CATEGORIES.find((c) => c.id === tool.category)?.name || '-';
      case 'rating':
        return (
          <div className="flex items-center gap-1">
            <Rating value={tool.rating} size="sm" readonly />
            <span className="text-sm text-gray-600 ml-1">({tool.reviewCount})</span>
          </div>
        );
      case 'price':
        return (
          <span className={cn('px-2 py-1 text-xs font-medium rounded-lg', PRICE_COLORS[tool.price])}>
            {PRICE_LABELS[tool.price]}
          </span>
        );
      case 'priceInfo':
        return tool.priceInfo || '-';
      case 'limitations':
        return tool.limitations && tool.limitations.length > 0 ? (
          <ul className="text-sm text-gray-600 space-y-1">
            {tool.limitations.map((lim, idx) => (
              <li key={idx}>• {lim}</li>
            ))}
          </ul>
        ) : (
          '-'
        );
      case 'tags':
        return tool.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {tool.tags.slice(0, 3).map((tag, idx) => (
              <TagBadge key={tag} label={tag} color={tagColors[idx % tagColors.length]} size="sm" />
            ))}
            {tool.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{tool.tags.length - 3}</span>
            )}
          </div>
        ) : (
          '-'
        );
      case 'isLinkValid':
        return (
          <span className={cn(
            'inline-flex items-center gap-1 text-sm',
            tool.isLinkValid ? 'text-emerald-600' : 'text-red-600'
          )}>
            {tool.isLinkValid ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {tool.isLinkValid ? '正常' : '失效'}
          </span>
        );
      case 'createdAt':
        return new Date(tool.createdAt).toLocaleDateString('zh-CN');
      default:
        return '-';
    }
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">工具对比</h1>
          <p className="text-gray-500 mt-1">
            横向对比不同工具的特性，找到最适合你的选择
          </p>
        </div>
        {compareTools.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleShare}
              leftIcon={<Share2 className="w-4 h-4" />}
            >
              分享
            </Button>
            <Button
              variant="secondary"
              onClick={handleExport}
              leftIcon={<Download className="w-4 h-4" />}
            >
              导出报告
            </Button>
            <Button
              variant="outline"
              onClick={clearCompareList}
            >
              清空列表
            </Button>
          </div>
        )}
      </div>

      {compareTools.length === 0 ? (
        <div className="max-w-md mx-auto py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-100 flex items-center justify-center">
            <GitCompare className="w-10 h-10 text-brand-600" />
          </div>
          <Empty
            icon="compare"
            title="对比列表为空"
            description="从工具库添加最多4个工具进行横向对比"
          />
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/library">
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                去添加工具
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {compareTools.map((tool) => (
              <Card key={tool.id} className="relative">
                <button
                  onClick={() => handleRemoveTool(tool.id)}
                  className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-red-100 rounded-full transition-colors z-10"
                  title="移除"
                >
                  <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
                </button>
                <div className="aspect-[16/10] overflow-hidden rounded-t-xl bg-gray-100">
                  {tool.screenshots[0] ? (
                    <img
                      src={tool.screenshots[0].url}
                      alt={tool.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-400 to-cyan-500">
                      <span className="text-4xl font-bold text-white/20">
                        {tool.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <Card.Body>
                  <div className="flex items-start justify-between mb-2">
                    <Link to={`/tool/${tool.id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-brand-600 transition-colors">
                        {tool.name}
                      </h3>
                    </Link>
                    {!tool.isLinkValid && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-lg">
                        <AlertTriangle className="w-3 h-3" />
                        失效
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {tool.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Rating value={tool.rating} size="sm" readonly />
                    <span className={cn('px-2 py-0.5 text-xs font-medium rounded-lg', PRICE_COLORS[tool.price])}>
                      {PRICE_LABELS[tool.price]}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      className="flex-1"
                      onClick={() => handleVisit(tool)}
                      leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      访问
                    </Button>
                    <Link to={`/tool/${tool.id}`}>
                      <Button size="sm" variant="secondary">
                        详情
                      </Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            ))}

            {compareTools.length < 4 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="group border-2 border-dashed border-gray-300 hover:border-brand-400 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors"
              >
                <div className="w-12 h-12 mb-3 rounded-full bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 text-gray-400 group-hover:text-brand-600" />
                </div>
                <p className="text-sm font-medium text-gray-600 group-hover:text-brand-600">
                  添加对比工具
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  还可添加 {4 - compareTools.length} 个
                </p>
              </button>
            )}
          </div>

          <Card>
            <Card.Header>
              <h2 className="font-semibold text-gray-900">参数对比</h2>
            </Card.Header>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 bg-gray-50 w-32">
                      特性
                    </th>
                    {compareTools.map((tool) => (
                      <th key={tool.id} className="px-6 py-4 text-left text-sm font-medium text-gray-900 min-w-48">
                        {tool.name}
                      </th>
                    ))}
                    {compareTools.length < 4 && (
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 min-w-48">
                        待添加
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {compareFields.map((field) => (
                    <tr key={field.key} className="border-b border-gray-100 last:border-0">
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 bg-gray-50">
                        {field.label}
                      </td>
                      {compareTools.map((tool) => (
                        <td key={tool.id} className="px-6 py-4 text-sm">
                          {renderFieldValue(tool, field.key)}
                        </td>
                      ))}
                      {compareTools.length < 4 && (
                        <td className="px-6 py-4 text-sm text-gray-400">-</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <Card.Header>
              <h2 className="font-semibold text-gray-900">优缺点对比</h2>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {compareTools.map((tool) => (
                  <div key={tool.id} className="space-y-4">
                    <h3 className="font-medium text-gray-900">{tool.name}</h3>
                    <div>
                      <p className="text-sm font-medium text-emerald-600 mb-2 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        优点
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 评分 {tool.rating}/5.0，用户评价良好</li>
                        {tool.isLinkValid && <li>• 链接访问正常</li>}
                        {tool.price === 'free' && <li>• 完全免费使用</li>}
                        {tool.price === 'freemium' && <li>• 基础功能免费</li>}
                        {tool.tags.length > 0 && <li>• 用途广泛，{tool.tags.length}个标签</li>}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-600 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        注意事项
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {!tool.isLinkValid && <li>• 链接可能已失效</li>}
                        {tool.price === 'paid' && <li>• 需要付费使用</li>}
                        {tool.limitations && tool.limitations.length > 0 && (
                          <li>• 有使用限制</li>
                        )}
                        {tool.reviewCount === 0 && <li>• 暂无用户评价</li>}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSearchQuery('');
        }}
        title="添加对比工具"
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
              <p className="text-sm text-gray-400 mt-1">所有工具都已在对比列表中</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto scrollbar-thin space-y-2">
              {availableTools.slice(0, 10).map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleAddTool(tool.id)}
                  disabled={compareList.length >= 4}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-400 to-cyan-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {tool.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{tool.name}</p>
                    <p className="text-sm text-gray-500 truncate">{tool.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Rating value={tool.rating} size="sm" readonly />
                    <Plus className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddModal(false);
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
