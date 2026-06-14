import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tool, Review, Note, Reminder, RecentUse } from '@/types';
import { generateId } from '@/utils/idGenerator';
import { checkLinkValidity } from '@/utils/linkChecker';
import { initializeMockData } from '@/assets/mock/data';

interface ToolState {
  tools: Tool[];
  reviews: Review[];
  notes: Note[];
  reminders: Reminder[];
  recentUses: RecentUse[];
  compareList: string[];
  
  addTool: (tool: Omit<Tool, 'id' | 'createdAt' | 'lastCheckedAt' | 'isLinkValid' | 'rating' | 'reviewCount'>) => Promise<{ success: boolean; duplicate?: boolean; tool?: Tool }>;
  updateTool: (id: string, updates: Partial<Tool>) => void;
  deleteTool: (id: string) => void;
  checkForDuplicate: (url: string) => Tool | undefined;
  addReview: (toolId: string, rating: number, comment: string) => void;
  addNote: (toolId: string, content: string) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  markAsUsed: (toolId: string) => void;
  addToCompare: (toolId: string) => boolean;
  removeFromCompare: (toolId: string) => void;
  clearCompareList: () => void;
  checkLink: (toolId: string) => Promise<void>;
  checkAllLinks: () => Promise<void>;
  markReminderAsRead: (id: string) => void;
  markAllRemindersAsRead: () => void;
  clearReminder: (id: string) => void;
  getToolById: (id: string) => Tool | undefined;
  getToolReviews: (toolId: string) => Review[];
  getToolNotes: (toolId: string) => Note[];
  getUnreadRemindersCount: () => number;
  getRecentTools: (limit?: number) => Tool[];
}

const initialData = initializeMockData();

export const useToolStore = create<ToolState>()(
  persist(
    (set, get) => ({
      tools: initialData.tools,
      reviews: initialData.reviews,
      notes: initialData.notes,
      reminders: initialData.reminders,
      recentUses: initialData.recentUses,
      compareList: initialData.compareList,

      addTool: async (toolData) => {
        const state = get();
        const normalizedUrl = toolData.url.toLowerCase().trim();
        
        const duplicate = state.checkForDuplicate(toolData.url);
        if (duplicate) {
          const reminder: Reminder = {
            id: generateId(),
            type: 'duplicate',
            toolId: duplicate.id,
            message: `${toolData.name} 与已收藏的 ${duplicate.name} 链接重复`,
            isRead: false,
            createdAt: Date.now(),
          };
          set((state) => ({
            reminders: [reminder, ...state.reminders],
          }));
          return { success: false, duplicate: true, tool: duplicate };
        }

        const isLinkValid = await checkLinkValidity(toolData.url);
        
        const newTool: Tool = {
          ...toolData,
          id: generateId(),
          rating: 0,
          reviewCount: 0,
          createdAt: Date.now(),
          lastCheckedAt: Date.now(),
          isLinkValid,
        };

        if (!isLinkValid) {
          const reminder: Reminder = {
            id: generateId(),
            type: 'broken-link',
            toolId: newTool.id,
            message: `${newTool.name} 链接检测失败，可能已失效`,
            isRead: false,
            createdAt: Date.now(),
          };
          set((state) => ({
            reminders: [reminder, ...state.reminders],
          }));
        }

        set((state) => ({
          tools: [newTool, ...state.tools],
        }));

        return { success: true, tool: newTool };
      },

      updateTool: (id, updates) => {
        set((state) => ({
          tools: state.tools.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      deleteTool: (id) => {
        set((state) => ({
          tools: state.tools.filter((t) => t.id !== id),
          reviews: state.reviews.filter((r) => r.toolId !== id),
          notes: state.notes.filter((n) => n.toolId !== id),
          reminders: state.reminders.filter((r) => r.toolId !== id),
          recentUses: state.recentUses.filter((r) => r.toolId !== id),
          compareList: state.compareList.filter((tid) => tid !== id),
        }));
      },

      checkForDuplicate: (url) => {
        const normalizedUrl = url.toLowerCase().trim().replace(/\/$/, '');
        return get().tools.find((t) => 
          t.url.toLowerCase().trim().replace(/\/$/, '') === normalizedUrl
        );
      },

      addReview: (toolId, rating, comment) => {
        const newReview: Review = {
          id: generateId(),
          toolId,
          rating,
          comment,
          createdAt: Date.now(),
        };

        set((state) => {
          const toolReviews = [...state.reviews.filter((r) => r.toolId === toolId), newReview];
          const avgRating = toolReviews.reduce((sum, r) => sum + r.rating, 0) / toolReviews.length;
          
          return {
            reviews: [newReview, ...state.reviews],
            tools: state.tools.map((t) =>
              t.id === toolId
                ? { ...t, rating: Math.round(avgRating * 10) / 10, reviewCount: toolReviews.length }
                : t
            ),
          };
        });
      },

      addNote: (toolId, content) => {
        const newNote: Note = {
          id: generateId(),
          toolId,
          content,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          notes: [newNote, ...state.notes],
        }));
      },

      updateNote: (id, content) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, content, updatedAt: Date.now() } : n
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        }));
      },

      markAsUsed: (toolId) => {
        set((state) => ({
          recentUses: [
            { toolId, usedAt: Date.now() },
            ...state.recentUses.filter((r) => r.toolId !== toolId),
          ].slice(0, 20),
          tools: state.tools.map((t) =>
            t.id === toolId ? { ...t, lastUsedAt: Date.now() } : t
          ),
        }));
      },

      addToCompare: (toolId) => {
        const state = get();
        if (state.compareList.includes(toolId)) return false;
        if (state.compareList.length >= 4) return false;
        
        set((state) => ({
          compareList: [...state.compareList, toolId],
        }));
        return true;
      },

      removeFromCompare: (toolId) => {
        set((state) => ({
          compareList: state.compareList.filter((id) => id !== toolId),
        }));
      },

      clearCompareList: () => {
        set({ compareList: [] });
      },

      checkLink: async (toolId) => {
        const tool = get().getToolById(toolId);
        if (!tool) return;

        const isLinkValid = await checkLinkValidity(tool.url);
        
        set((state) => {
          const updates: Partial<Tool> = {
            isLinkValid,
            lastCheckedAt: Date.now(),
          };

          let newReminders = [...state.reminders];
          if (!isLinkValid && !state.reminders.some((r) => r.type === 'broken-link' && r.toolId === toolId)) {
            newReminders.unshift({
              id: generateId(),
              type: 'broken-link',
              toolId,
              message: `${tool.name} 链接检测失败，可能已失效`,
              isRead: false,
              createdAt: Date.now(),
            });
          }

          return {
            tools: state.tools.map((t) =>
              t.id === toolId ? { ...t, ...updates } : t
            ),
            reminders: newReminders,
          };
        });
      },

      checkAllLinks: async () => {
        const tools = get().tools;
        for (const tool of tools) {
          await get().checkLink(tool.id);
        }
      },

      markReminderAsRead: (id) => {
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, isRead: true } : r
          ),
        }));
      },

      markAllRemindersAsRead: () => {
        set((state) => ({
          reminders: state.reminders.map((r) => ({ ...r, isRead: true })),
        }));
      },

      clearReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
        }));
      },

      getToolById: (id) => {
        return get().tools.find((t) => t.id === id);
      },

      getToolReviews: (toolId) => {
        return get().reviews.filter((r) => r.toolId === toolId);
      },

      getToolNotes: (toolId) => {
        return get().notes.filter((n) => n.toolId === toolId);
      },

      getUnreadRemindersCount: () => {
        return get().reminders.filter((r) => !r.isRead).length;
      },

      getRecentTools: (limit = 8) => {
        const state = get();
        return state.recentUses
          .slice(0, limit)
          .map((r) => state.getToolById(r.toolId))
          .filter((t): t is Tool => t !== undefined);
      },
    }),
    {
      name: 'toolbox_data',
    }
  )
);
