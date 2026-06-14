import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Plus,
  Bell,
  User,
  Menu,
  X,
  Package,
  LayoutGrid,
  GitCompare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import { useToolStore } from '@/store/useToolStore';
import { useUIStore } from '@/store/useUIStore';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const unreadCount = useToolStore((state) => state.getUnreadRemindersCount());
  const compareList = useToolStore((state) => state.compareList);
  const openAddToolModal = useUIStore((state) => state.openAddToolModal);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const showToast = useUIStore((state) => state.showToast);
  const filters = useUIStore((state) => state.filters);
  const setFilters = useUIStore((state) => state.setFilters);
  const resetFilters = useUIStore((state) => state.resetFilters);

  useEffect(() => {
    if (location.pathname === '/library') {
      setSearchQuery(filters.search || '');
    } else {
      setSearchQuery('');
    }
  }, [location.pathname, filters.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (location.pathname === '/library') {
      if (query) {
        resetFilters();
        setFilters({ search: query });
      } else {
        resetFilters();
      }
    } else if (query) {
      navigate(`/library?search=${encodeURIComponent(query)}`);
    }
  };

  const navItems = [
    { path: '/', label: '首页', icon: <LayoutGrid className="w-4 h-4" /> },
    { path: '/library', label: '分类库', icon: <Package className="w-4 h-4" /> },
    { 
      path: '/compare', 
      label: '对比', 
      icon: <GitCompare className="w-4 h-4" />,
      badge: compareList.length > 0 ? compareList.length : undefined,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-xl group-hover:shadow-brand-500/30 transition-shadow">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-cyan-600 bg-clip-text text-transparent hidden sm:block">
                ToolBox
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 ml-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    location.pathname === item.path
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {item.icon}
                  {item.label}
                  {item.badge && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-brand-600 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden sm:block relative w-64 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索工具、标签..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all"
              />
            </form>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                openAddToolModal();
                showToast('添加新工具到您的收藏夹', 'info');
              }}
              className="hidden sm:inline-flex"
            >
              添加工具
            </Button>

            <Link
              to="/profile"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-brand-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </Link>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showMobileMenu ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMobileMenu(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    location.pathname === item.path
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {item.icon}
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs bg-brand-600 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
            <div className="mt-4 px-4">
              <form onSubmit={handleSearch} className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索工具..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </form>
              <Button
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  openAddToolModal();
                  setShowMobileMenu(false);
                }}
                className="w-full"
              >
                添加工具
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
