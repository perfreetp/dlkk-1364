export interface Tool {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  price: 'free' | 'freemium' | 'paid';
  priceInfo?: string;
  limitations?: string[];
  screenshots: Screenshot[];
  rating: number;
  reviewCount: number;
  alternatives: string[];
  createdAt: number;
  lastUsedAt?: number;
  isLinkValid: boolean;
  lastCheckedAt: number;
}

export interface Screenshot {
  id: string;
  url: string;
  thumbnail?: string;
  caption?: string;
  uploadedAt: number;
}

export interface Review {
  id: string;
  toolId: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export interface Note {
  id: string;
  toolId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  cover?: string;
  toolIds: string[];
  isPublic: boolean;
  shareToken?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  toolCount: number;
}

export interface Reminder {
  id: string;
  type: 'broken-link' | 'duplicate' | 'update';
  toolId: string;
  message: string;
  isRead: boolean;
  createdAt: number;
}

export interface RecentUse {
  toolId: string;
  usedAt: number;
}

export interface AppState {
  tools: Tool[];
  collections: Collection[];
  tags: Tag[];
  reviews: Review[];
  notes: Note[];
  reminders: Reminder[];
  recentUses: RecentUse[];
  compareList: string[];
}

export interface FilterOptions {
  category?: string;
  tags?: string[];
  price?: ('free' | 'freemium' | 'paid')[];
  minRating?: number;
  search?: string;
  sortBy?: 'rating' | 'name' | 'recent' | 'created';
  sortOrder?: 'asc' | 'desc';
}

export type CategoryType = 
  | 'all'
  | 'design'
  | 'development'
  | 'productivity'
  | 'marketing'
  | 'data'
  | 'ai'
  | 'other';

export const CATEGORIES: { id: CategoryType; name: string; icon: string }[] = [
  { id: 'all', name: '全部', icon: 'LayoutGrid' },
  { id: 'design', name: '设计工具', icon: 'Palette' },
  { id: 'development', name: '开发工具', icon: 'Code' },
  { id: 'productivity', name: '效率工具', icon: 'Zap' },
  { id: 'marketing', name: '运营营销', icon: 'TrendingUp' },
  { id: 'data', name: '数据分析', icon: 'BarChart3' },
  { id: 'ai', name: 'AI 工具', icon: 'Sparkles' },
  { id: 'other', name: '其他', icon: 'MoreHorizontal' },
];

export const PRICE_LABELS: Record<Tool['price'], string> = {
  free: '免费',
  freemium: '免费增值',
  paid: '付费',
};

export const PRICE_COLORS: Record<Tool['price'], string> = {
  free: 'bg-emerald-100 text-emerald-700',
  freemium: 'bg-amber-100 text-amber-700',
  paid: 'bg-rose-100 text-rose-700',
};
