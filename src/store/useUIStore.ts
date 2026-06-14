import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FilterOptions, FilterPreset } from '@/types';
import { generateId } from '@/utils/idGenerator';

interface UIState {
  isAddToolModalOpen: boolean;
  isCollectionModalOpen: boolean;
  isBookmarkImportModalOpen: boolean;
  isScreenshotViewerOpen: boolean;
  currentScreenshotIndex: number;
  currentScreenshotToolId: string | null;
  filters: FilterOptions;
  filterPresets: FilterPreset[];
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
  saveFilterPreset: (name: string) => FilterPreset;
  applyFilterPreset: (presetId: string) => void;
  deleteFilterPreset: (presetId: string) => void;
  updateFilterPreset: (presetId: string, name?: string) => void;
  setViewMode: (mode: 'card' | 'list') => void;
  toggleSidebar: () => void;
  setActiveProfileTab: (tab: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
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
      filterPresets: [],
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
      saveFilterPreset: (name) => {
        const state = get();
        const existing = state.filterPresets.find((p) => p.name === name);
        if (existing) {
          const updated = {
            ...existing,
            filters: { ...state.filters },
            updatedAt: Date.now(),
          };
          set({
            filterPresets: state.filterPresets.map((p) =>
              p.id === existing.id ? updated : p
            ),
          });
          return updated;
        }
        const newPreset: FilterPreset = {
          id: generateId(),
          name,
          filters: { ...state.filters },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set({ filterPresets: [...state.filterPresets, newPreset] });
        return newPreset;
      },
      applyFilterPreset: (presetId) => {
        const preset = get().filterPresets.find((p) => p.id === presetId);
        if (preset) {
          set({ filters: { ...preset.filters } });
        }
      },
      deleteFilterPreset: (presetId) => {
        set((state) => ({
          filterPresets: state.filterPresets.filter((p) => p.id !== presetId),
        }));
      },
      updateFilterPreset: (presetId, name) => {
        set((state) => ({
          filterPresets: state.filterPresets.map((p) =>
            p.id === presetId
              ? {
                  ...p,
                  name: name || p.name,
                  filters: { ...state.filters },
                  updatedAt: Date.now(),
                }
              : p
          ),
        }));
      },
      setViewMode: (mode) => set({ viewMode: mode }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setActiveProfileTab: (tab) => set({ activeProfileTab: tab }),
      showToast: (message, type = 'success') => {
        set({ toast: { message, type } });
        setTimeout(() => set({ toast: null }), 3000);
      },
      hideToast: () => set({ toast: null }),
    }),
    {
      name: 'toolbox_ui',
      partialize: (state) => ({
        filterPresets: state.filterPresets,
        viewMode: state.viewMode,
        sidebarCollapsed: state.sidebarCollapsed,
        activeProfileTab: state.activeProfileTab,
      }),
    }
  )
);
