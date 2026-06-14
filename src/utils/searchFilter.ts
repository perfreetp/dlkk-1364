import Fuse from 'fuse.js';
import type { Tool, FilterOptions } from '@/types';

export const createSearchIndex = (tools: Tool[]) => {
  const options = {
    keys: [
      { name: 'name', weight: 3 },
      { name: 'description', weight: 2 },
      { name: 'tags', weight: 2 },
      { name: 'category', weight: 1 },
    ],
    threshold: 0.4,
    includeScore: true,
  };

  return new Fuse(tools, options);
};

export const filterTools = (
  tools: Tool[],
  filters: FilterOptions
): Tool[] => {
  let result = [...tools];

  if (filters.search && filters.search.trim()) {
    const fuse = createSearchIndex(result);
    const searchResults = fuse.search(filters.search.trim());
    result = searchResults.map((r) => r.item);
  }

  if (filters.category && filters.category !== 'all') {
    result = result.filter((tool) => tool.category === filters.category);
  }

  if (filters.tags && filters.tags.length > 0) {
    result = result.filter((tool) =>
      filters.tags!.some((tag) => tool.tags.includes(tag))
    );
  }

  if (filters.price && filters.price.length > 0) {
    result = result.filter((tool) => filters.price!.includes(tool.price));
  }

  if (filters.minRating) {
    result = result.filter((tool) => tool.rating >= filters.minRating!);
  }

  if (filters.sortBy) {
    result = sortTools(result, filters.sortBy, filters.sortOrder || 'desc');
  }

  return result;
};

export const sortTools = (
  tools: Tool[],
  sortBy: FilterOptions['sortBy'] = 'rating',
  sortOrder: 'asc' | 'desc' = 'desc'
): Tool[] => {
  const sorted = [...tools];

  switch (sortBy) {
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'recent':
      sorted.sort(
        (a, b) => (b.lastUsedAt || 0) - (a.lastUsedAt || 0)
      );
      break;
    case 'created':
      sorted.sort((a, b) => b.createdAt - a.createdAt);
      break;
  }

  return sortOrder === 'asc' ? sorted.reverse() : sorted;
};
