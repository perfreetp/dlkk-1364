import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Clock,
  TrendingUp,
  Search,
  Plus,
  ArrowRight,
  LayoutGrid,
  Palette,
  Code,
  Zap,
  BarChart3,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ToolCard } from '@/components/business/ToolCard';
import { TagBadge } from '@/components/common/TagBadge';
import { useToolStore } from '@/store/useToolStore';
import { useCollectionStore } from '@/store/useCollectionStore';
import { useUIStore } from '@/store/useUIStore';
import { CATEGORIES, PRICE_COLORS, PRICE_LABELS } from '@/types';
import { cn } from '@/lib/utils';

const categoryIcons: Record<string, React.ReactNode> = {
  all: <LayoutGrid className="w-5 h-5" />,
  design: <Palette className="w-5 h-5" />,
  development: <Code className="w-5 h-5" />,
  productivity: <Zap className="w-5 h-5" />,
  marketing: <TrendingUp className="w-5 h-5" />,
  data: <BarChart3 className="w-5 h-5" />,
  ai: <Sparkles className="w-5 h-5" />,
  other: <MoreHorizontal className="w-5 h-5" />,
};

export default function Home() {
  const tools = useToolStore((state) => state.tools);
  const getRecentTools = useToolStore((state) => state.getRecentTools);
  const collections = useCollectionStore((state) => state.collections);
  const getAllTags = useCollectionStore((state) => state.getAllTags);
  const openAddToolModal = useUIStore((state) => state.openAddToolModal);
  const setFilters = useUIStore((state) => state.setFilters);

  const recentTools = getRecentTools(6);
  const topRatedTools = [...tools].sort((a, b) => b.rating - a.rating).slice(0, 6);
  const popularTags = getAllTags().slice(0, 10);

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return tools.length;
    return tools.filter((t) => t.category === categoryId).length;
  };

  const handleCategoryClick = (categoryId: string) => {
    setFilters({ category: categoryId });
    window.location.href = '/library';
  };

  const handleTagClick = (tag: string) => {
    setFilters({ tags: [tag] });
    window.location.href = '/library';
  };

  const tagColors = ['blue', 'green', 'amber', 'purple', 'cyan', 'pink'];

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-cyan-600 p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptLTYgMGg0djFoLTR2LTF6bTEyLTZoLTR2MWg0di0xem0tNiAwaC00djFoNHYtMXptLTYgMGgtNHYxaDR2LTF6bTEyLTZoLTR2MWg0di0xem0tNiAwaC00djFoNHYtMXptLTYgMGgtNHYxaDR2LTF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>已收录 {tools.length} 款优质工具</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            你的在线工具
            <br />
            <span className="text-brand-200">收藏管理专家</span>
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-xl">
            把零散的工具网址整理成可复用的资产，支持分类收藏、对比分析、使用笔记，
            让每一款工具都发挥最大价值。
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/library">
              <Button
                size="lg"
                className="bg-white text-brand-600 hover:bg-gray-100"
                leftIcon={<Search className="w-5 h-5" />}
              >
                浏览工具库
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white/50 text-white hover:bg-white/10"
              onClick={openAddToolModal}
              leftIcon={<Plus className="w-5 h-5" />}
            >
              添加新工具
            </Button>
          </div>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-br from-cyan-400/30 to-brand-400/30 rounded-full blur-3xl" />
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">分类浏览</h2>
            <p className="text-gray-500 mt-1">按分类快速找到你需要的工具</p>
          </div>
          <Link to="/library">
            <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>
              查看全部
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.filter((c) => c.id !== 'all').map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="group p-6 bg-white rounded-2xl border border-gray-200 hover:border-brand-300 hover:shadow-lg transition-all duration-300 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-cyan-100 flex items-center justify-center text-brand-600 mb-4 group-hover:scale-110 transition-transform">
                {categoryIcons[category.id]}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
              <p className="text-sm text-gray-500">{getCategoryCount(category.id)} 款工具</p>
            </button>
          ))}
        </div>
      </section>

      {recentTools.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">最近使用</h2>
                <p className="text-sm text-gray-500">快速访问你常用的工具</p>
              </div>
            </div>
            <Link to="/library">
              <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>
                查看全部
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} viewMode="card" />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">热门推荐</h2>
              <p className="text-sm text-gray-500">社区评分最高的工具</p>
            </div>
          </div>
          <Link to="/library">
            <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>
              查看全部
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topRatedTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} viewMode="card" />
          ))}
        </div>
      </section>

      {collections.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">精选收藏夹</h2>
              <p className="text-sm text-gray-500 mt-1">按场景整理的工具集合</p>
            </div>
            <Link to="/profile">
              <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>
                管理收藏夹
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {collections.slice(0, 4).map((collection) => (
              <Link
                key={collection.id}
                to={`/collection/${collection.id}`}
                className="group"
              >
                <Card hoverable className="h-full">
                  <Card.Body>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                        {collection.name.charAt(0)}
                      </div>
                      {collection.isPublic && (
                        <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                          公开
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-brand-600 transition-colors">
                      {collection.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {collection.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{collection.toolIds.length} 款工具</span>
                    </div>
                  </Card.Body>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {popularTags.length > 0 && (
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">热门标签</h2>
            <p className="text-sm text-gray-500">按用途标签快速筛选</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag, idx) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105',
                  PRICE_COLORS['freemium']
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            还在零散保存工具链接？
          </h2>
          <p className="text-gray-300 mb-8">
            现在就开始整理你的工具库，让每一款工具都随时可用。
            支持批量导入浏览器书签，一键迁移你的收藏。
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-brand-500 hover:bg-brand-600"
              onClick={openAddToolModal}
              leftIcon={<Plus className="w-5 h-5" />}
            >
              添加第一个工具
            </Button>
            <Link to="/compare">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                对比工具
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
