import React from 'react';
import { Link, useLocation, useNavigate, createSearchParams } from 'react-router-dom';
import {
  LayoutGrid,
  Palette,
  Code,
  Zap,
  TrendingUp,
  BarChart3,
  Sparkles,
  MoreHorizontal,
  FolderPlus,
  Folder,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import { CATEGORIES, type CategoryType } from '@/types';
import { useCollectionStore } from '@/store/useCollectionStore';
import { useToolStore } from '@/store/useToolStore';
import { useUIStore } from '@/store/useUIStore';

const iconMap: Record<string, React.ReactNode> = {
  LayoutGrid: <LayoutGrid className="w-5 h-5" />,
  Palette: <Palette className="w-5 h-5" />,
  Code: <Code className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  BarChart3: <BarChart3 className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  MoreHorizontal: <MoreHorizontal className="w-5 h-5" />,
};

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const collections = useCollectionStore((state) => state.collections);
  const tools = useToolStore((state) => state.tools);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const openCollectionModal = useUIStore((state) => state.openCollectionModal);
  const setFilters = useUIStore((state) => state.setFilters);

  const handleCategoryClick = (categoryId: CategoryType) => {
    setFilters({ category: categoryId });
    navigate({
      pathname: '/library',
      search: `?${createSearchParams({ category: categoryId })}`,
    });
  };

  const getToolCountForCategory = (categoryId: string) => {
    const allTools = useToolStore.getState().tools;
    if (categoryId === 'all') return allTools.length;
    return allTools.filter((t) => t.category === categoryId).length;
  };

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-[calc(100vh-4rem)] sticky top-16 border-r border-gray-200 bg-white transition-all duration-300',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex-1 overflow-y-auto py-6">
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            {!sidebarCollapsed && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                工具分类
              </h3>
            )}
          </div>
          <nav className="space-y-1">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  location.pathname === '/library' 
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                  {iconMap[category.icon]}
                </span>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">{category.name}</span>
                    <span className="text-xs text-gray-400 font-medium">
                      {getToolCountForCategory(category.id)}
                    </span>
                  </>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            {!sidebarCollapsed && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                我的收藏夹
              </h3>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={openCollectionModal}
              className="p-1.5"
            >
              <FolderPlus className="w-4 h-4 text-gray-400 hover:text-brand-600 transition-colors" />
            </Button>
          </div>
          <nav className="space-y-1">
            {collections.slice(0, 8).map((collection) => (
              <Link
                key={collection.id}
                to={`/collection/${collection.id}`}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group',
                  location.pathname === `/collection/${collection.id}`
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-100 to-brand-100 flex items-center justify-center">
                  <Folder className="w-4 h-4 text-brand-600" />
                </span>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{collection.name}</span>
                    <span className="text-xs text-gray-400 font-medium">
                      {collection.toolIds.length}
                    </span>
                  </>
                )}
              </Link>
            ))}
            {collections.length > 8 && !sidebarCollapsed && (
              <Link
                to="/profile"
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                查看全部收藏夹
              </Link>
            )}
          </nav>
        </div>

        {!sidebarCollapsed && (
          <div className="px-4 mt-8">
            <div className="rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-cyan-500 p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative">
                <h4 className="font-semibold mb-1">分享您的收藏</h4>
                <p className="text-xs text-white/80 mb-3">
                  生成可分享的工具清单，帮助团队提高效率
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                  className="bg-white/20 hover:bg-white/30 text-white border-0 w-full"
                  onClick={() => navigate('/profile')}
                >
                  管理收藏夹
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
