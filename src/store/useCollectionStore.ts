import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Collection, Tag } from '@/types';
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
  generateShareLink: (collectionId: string) => string;
  shareCollection: (collectionId: string) => Promise<boolean>;
  exportCollection: (collectionId: string, format: 'json' | 'html') => void;
  exportAll: (format: 'json' | 'html') => void;
  importTools: (tools: Array<{ name: string; title?: string; url: string; description?: string; folder?: string }>) => Promise<number>;
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
        const { addTool, checkForDuplicate } = useToolStore.getState();
        let importedCount = 0;

        for (const bookmark of bookmarks) {
          const duplicate = checkForDuplicate(bookmark.url);
          if (duplicate) continue;

          let category = 'other';
          if (bookmark.folder) {
            const folderLower = bookmark.folder.toLowerCase();
            if (folderLower.includes('design') || folderLower.includes('设计')) category = 'design';
            else if (folderLower.includes('dev') || folderLower.includes('开发') || folderLower.includes('code')) category = 'development';
            else if (folderLower.includes('productivity') || folderLower.includes('效率')) category = 'productivity';
            else if (folderLower.includes('market') || folderLower.includes('运营') || folderLower.includes('营销')) category = 'marketing';
            else if (folderLower.includes('data') || folderLower.includes('数据')) category = 'data';
            else if (folderLower.includes('ai') || folderLower.includes('人工智能')) category = 'ai';
          }

          const result = await addTool({
            name: bookmark.name || bookmark.title || bookmark.url,
            url: bookmark.url,
            description: bookmark.description || '',
            category,
            tags: [],
            price: 'free',
            screenshots: [],
            alternatives: [],
          });

          if (result.success) {
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
              if (result.tool) {
                get().addToolToCollection(collection.id, result.tool.id);
              }
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
