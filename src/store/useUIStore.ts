import { create } from 'zustand';
import type { FilterOptions } from '@/types';

interface UIState {
  isAddToolModalOpen: boolean;
  isCollectionModalOpen: boolean;
  isBookmarkImportModalOpen: boolean;
  isScreenshotViewerOpen: boolean;
  currentScreenshotIndex: number;
  currentScreenshotToolId: string | null;
  filters: FilterOptions;
  viewMode: 'card' | 'list';
  sidebarCollapsed: boolean;
  activeProfileTab: string;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;

  openAddToolModal: () => void;
  closeAddToolModal: () => void;
  openCollectionModal: () => void;
  closeCollectionModal: () => void;
  openBookmarkImportModal: () => void;
  closeBookmarkImportModal: () => void;
  openScreenshotViewer: (toolId: string, index: number) => void;
  closeScreenshotViewer: () => void;
  setCurrentScreenshotIndex: (index: number) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  setViewMode: (mode: 'card' | 'list') => void;
  toggleSidebar: () => void;
  setActiveProfileTab: (tab: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAddToolModalOpen: false,
  isCollectionModalOpen: false,
  isBookmarkImportModalOpen: false,
  isScreenshotViewerOpen: false,
  currentScreenshotIndex: 0,
  currentScreenshotToolId: null,
  filters: {
    category: 'all',
    tags: [],
    price: [],
    minRating: 0,
    search: '',
    sortBy: 'rating',
    sortOrder: 'desc',
  },
  viewMode: 'card',
  sidebarCollapsed: false,
  activeProfileTab: 'collections',
  toast: null,

  openAddToolModal: () => set({ isAddToolModalOpen: true }),
  closeAddToolModal: () => set({ isAddToolModalOpen: false }),
  openCollectionModal: () => set({ isCollectionModalOpen: true }),
  closeCollectionModal: () => set({ isCollectionModalOpen: false }),
  openBookmarkImportModal: () => set({ isBookmarkImportModalOpen: true }),
  closeBookmarkImportModal: () => set({ isBookmarkImportModalOpen: false }),
  openScreenshotViewer: (toolId, index) => set({
    isScreenshotViewerOpen: true,
    currentScreenshotToolId: toolId,
    currentScreenshotIndex: index,
  }),
  closeScreenshotViewer: () => set({
    isScreenshotViewerOpen: false,
    currentScreenshotToolId: null,
    currentScreenshotIndex: 0,
  }),
  setCurrentScreenshotIndex: (index) => set({ currentScreenshotIndex: index }),
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),
  resetFilters: () => set({
    filters: {
      category: 'all',
      tags: [],
      price: [],
      minRating: 0,
      search: '',
      sortBy: 'rating',
      sortOrder: 'desc',
    },
  }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setActiveProfileTab: (tab) => set({ activeProfileTab: tab }),
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },
  hideToast: () => set({ toast: null }),
}));
