import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Collection, Tag, Tool } from '@/types';
import { generateId } from '@/utils/idGenerator';
import { createShareToken, copyToClipboard, generateShareContent, exportToJSON, exportToBookmarksHTML, downloadFile } from '@/utils/exportUtils';
import { useToolStore } from './useToolStore';

interface CollectionState {
  collections: Collection[];
  tags: Tag[];
  
  addCollection: (data: Omit<Collection, 'id' | 'toolIds' | 'createdAt' | 'updatedAt'>) => Collection;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  addToolToCollection: (collectionId: string, toolId: string) => void;
  removeToolFromCollection: (collectionId: string, toolId: string) => void;
  getCollectionById: (id: string) => Collection | undefined;
  getCollectionsForTool: (toolId: string) => Collection[];
  getSharedCollection: (shareToken: string) => { collection: Collection; tools: Tool[] } | null;
  getToolById: (id: string) => Tool | undefined;
  generateShareLink: (collectionId: string) => string;
  shareCollection: (collectionId: string) => Promise<boolean>;
  shareCollectionAsLink: (collectionId: string) => Promise<{ success: boolean; url?: string }>;
  exportCollection: (collectionId: string, format: 'json' | 'html') => void;
  exportAll: (format: 'json' | 'html') => void;
  importTools: (tools: Array<{ name: string; title?: string; url: string; description?: string; folder?: string; category?: string; tags?: string[]; price?: string; rating?: number; reviewCount?: number; alternatives?: string[]; priceInfo?: string; limitations?: string[] }>) => Promise<number>;
  addTag: (name: string, color: string) => Tag;
  getAllTags: () => string[];
}

const initialData = JSON.parse(localStorage.getItem('toolbox_data') || '{}');

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      collections: initialData.collections || [],
      tags: initialData.tags || [],

      addCollection: (data) => {
        const newCollection: Collection = {
          ...data,
          id: generateId(),
          toolIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          collections: [newCollection, ...state.collections],
        }));
        return newCollection;
      },

      updateCollection: (id, updates) => {
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
          ),
        }));
      },

      deleteCollection: (id) => {
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
        }));
      },

      addToolToCollection: (collectionId, toolId) => {
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId && !c.toolIds.includes(toolId)
              ? { ...c, toolIds: [...c.toolIds, toolId], updatedAt: Date.now() }
              : c
          ),
        }));
      },

      removeToolFromCollection: (collectionId, toolId) => {
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId
              ? { ...c, toolIds: c.toolIds.filter((id) => id !== toolId), updatedAt: Date.now() }
              : c
          ),
        }));
      },

      getCollectionById: (id) => {
        return get().collections.find((c) => c.id === id);
      },

      getCollectionsForTool: (toolId) => {
        return get().collections.filter((c) => c.toolIds.includes(toolId));
      },

      getSharedCollection: (shareToken) => {
        const collection = get().collections.find(
          (c) => c.shareToken === shareToken && c.isPublic
        );
        if (!collection) return null;

        const tools = useToolStore.getState().tools.filter((t) =>
          collection.toolIds.includes(t.id)
        );
        return { collection, tools };
      },

      getToolById: (id) => {
        return useToolStore.getState().tools.find((t) => t.id === id);
      },

      generateShareLink: (collectionId) => {
        const collection = get().getCollectionById(collectionId);
        if (!collection) return '';

        const shareToken = collection.shareToken || createShareToken();
        if (!collection.shareToken) {
          get().updateCollection(collectionId, { shareToken, isPublic: true });
        }

        return `${window.location.origin}/share/${shareToken}`;
      },

      shareCollection: async (collectionId) => {
        const collection = get().getCollectionById(collectionId);
        if (!collection) return false;

        const tools = useToolStore.getState().tools;
        const content = generateShareContent(collection, tools);
        return copyToClipboard(content);
      },

      shareCollectionAsLink: async (collectionId) => {
        const collection = get().getCollectionById(collectionId);
        if (!collection) return { success: false };

        const shareToken = collection.shareToken || createShareToken();
        if (!collection.shareToken) {
          get().updateCollection(collectionId, { shareToken, isPublic: true });
        }

        const url = `${window.location.origin}/share/${shareToken}`;
        const copied = await copyToClipboard(url);
        return { success: copied, url };
      },

      exportCollection: (collectionId, format) => {
        const collection = get().getCollectionById(collectionId);
        if (!collection) return;

        const tools = useToolStore.getState().tools.filter((t) =>
          collection.toolIds.includes(t.id)
        );
        const collections = [collection];

        if (format === 'json') {
          const content = exportToJSON(tools, collections);
          downloadFile(content, `${collection.name}.json`, 'application/json');
        } else {
          const content = exportToBookmarksHTML(tools, collections);
          downloadFile(content, `${collection.name}.html`, 'text/html');
        }
      },

      exportAll: (format) => {
        const tools = useToolStore.getState().tools;
        const collections = get().collections;

        if (format === 'json') {
          const content = exportToJSON(tools, collections);
          downloadFile(content, `toolbox-backup-${Date.now()}.json`, 'application/json');
        } else {
          const content = exportToBookmarksHTML(tools, collections);
          downloadFile(content, `toolbox-bookmarks.html`, 'text/html');
        }
      },

      importTools: async (bookmarks) => {
        const { addTool, checkForDuplicate, updateTool } = useToolStore.getState();
        let importedCount = 0;

        for (const bookmark of bookmarks) {
          const duplicate = checkForDuplicate(bookmark.url);
          if (duplicate) continue;

          let category = bookmark.category;
          if (!category && bookmark.folder) {
            const folderLower = bookmark.folder.toLowerCase();
            if (folderLower.includes('design') || folderLower.includes('设计')) category = 'design';
            else if (folderLower.includes('dev') || folderLower.includes('开发') || folderLower.includes('code')) category = 'development';
            else if (folderLower.includes('productivity') || folderLower.includes('效率')) category = 'productivity';
            else if (folderLower.includes('market') || folderLower.includes('运营') || folderLower.includes('营销')) category = 'marketing';
            else if (folderLower.includes('data') || folderLower.includes('数据')) category = 'data';
            else if (folderLower.includes('ai') || folderLower.includes('人工智能')) category = 'ai';
          }
          if (!category) category = 'other';

          const validCategories = ['design', 'development', 'productivity', 'marketing', 'data', 'ai', 'other'];
          if (!validCategories.includes(category)) {
            category = 'other';
          }

          let description = bookmark.description || '';
          let alternatives: string[] = [];

          if (bookmark.alternatives && bookmark.alternatives.length > 0) {
            const currentTools = useToolStore.getState().tools;
            alternatives = bookmark.alternatives
              .map((name) => currentTools.find((t) => t.name === name)?.id)
              .filter((id): id is string => !!id);
          } else if (description) {
            const altMatch = description.match(/[|｜]?\s*替代工具[：:]\s*(.+)$/);
            if (altMatch) {
              const altNamesStr = altMatch[1].trim();
              const altNames = altNamesStr.split(/[、,，]/).map((s) => s.trim()).filter(Boolean);
              const currentTools = useToolStore.getState().tools;
              alternatives = altNames
                .map((name) => currentTools.find((t) => t.name === name)?.id)
                .filter((id): id is string => !!id);
              description = description.replace(altMatch[0], '').trim();
              if (description.endsWith('|') || description.endsWith('｜')) {
                description = description.slice(0, -1).trim();
              }
            }
          }

          let price: 'free' | 'freemium' | 'paid' = 'free';
          if (bookmark.price === 'free' || bookmark.price === 'freemium' || bookmark.price === 'paid') {
            price = bookmark.price;
          }

          const result = await addTool({
            name: bookmark.name || bookmark.title || bookmark.url,
            url: bookmark.url,
            description,
            category,
            tags: bookmark.tags || [],
            price,
            priceInfo: bookmark.priceInfo,
            limitations: bookmark.limitations,
            screenshots: [],
            alternatives,
          });

          if (result.success && result.tool) {
            if ((bookmark.rating !== undefined && bookmark.rating !== null) || 
                (bookmark.reviewCount !== undefined && bookmark.reviewCount !== null)) {
              const updates: Partial<Tool> = {};
              if (bookmark.rating !== undefined && bookmark.rating !== null) {
                updates.rating = bookmark.rating;
              }
              if (bookmark.reviewCount !== undefined && bookmark.reviewCount !== null) {
                updates.reviewCount = bookmark.reviewCount;
              }
              updateTool(result.tool.id, updates);
            }

            importedCount++;

            if (bookmark.folder) {
              let collection = get().collections.find(
                (c) => c.name.toLowerCase() === bookmark.folder!.toLowerCase()
              );
              if (!collection) {
                collection = get().addCollection({
                  name: bookmark.folder,
                  description: `从书签导入的"${bookmark.folder}"分类`,
                  isPublic: false,
                });
              }
              get().addToolToCollection(collection.id, result.tool.id);
            }
          }
        }

        return importedCount;
      },

      addTag: (name, color) => {
        const existingTag = get().tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
        if (existingTag) return existingTag;

        const newTag: Tag = {
          id: generateId(),
          name,
          color,
          toolCount: 0,
        };

        set((state) => ({
          tags: [...state.tags, newTag],
        }));

        return newTag;
      },

      getAllTags: () => {
        const tools = useToolStore.getState().tools;
        const tagSet = new Set<string>();
        tools.forEach((t) => t.tags.forEach((tag) => tagSet.add(tag)));
        return Array.from(tagSet).sort();
      },
    }),
    {
      name: 'toolbox_data',
      partialize: (state) => ({
        collections: state.collections,
        tags: state.tags,
      }),
      merge: (persistedState, currentState) => {
        const parsed = persistedState as Partial<CollectionState>;
        return {
          ...currentState,
          collections: parsed.collections || currentState.collections,
          tags: parsed.tags || currentState.tags,
        };
      },
    }
  )
);
