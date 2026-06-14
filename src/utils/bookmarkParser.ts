export interface ParsedBookmark {
  title: string;
  name: string;
  url: string;
  folder: string;
  description?: string;
  addDate?: number;
  category?: string;
  tags?: string[];
  price?: string;
  rating?: number;
  reviewCount?: number;
  alternatives?: string[];
  priceInfo?: string;
  limitations?: string[];
}

const parseDDContent = (content: string): {
  description?: string;
  category?: string;
  tags?: string[];
  price?: string;
  rating?: number;
  reviewCount?: number;
  alternatives?: string[];
  priceInfo?: string;
  limitations?: string[];
} => {
  const parts = content.split('|||').map(p => p.trim());
  
  if (parts.length === 1) {
    const altMatch = content.match(/[|｜]?\s*替代工具[：:]\s*(.+)$/);
    if (altMatch) {
      const altNamesStr = altMatch[1].trim();
      const alternatives = altNamesStr.split(/[、,，]/).map((s) => s.trim()).filter(Boolean);
      let description = content.replace(altMatch[0], '').trim();
      if (description.endsWith('|') || description.endsWith('｜')) {
        description = description.slice(0, -1).trim();
      }
      return { description: description || undefined, alternatives };
    }
    return { description: content.trim() || undefined };
  }
  
  const result: ReturnType<typeof parseDDContent> = {};
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i === 0 && !part.includes(':')) {
      result.description = part || undefined;
      continue;
    }
    
    const colonIndex = part.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = part.slice(0, colonIndex).trim();
    const value = part.slice(colonIndex + 1).trim();
    
    switch (key) {
      case '分类':
        result.category = value || undefined;
        break;
      case '标签':
        if (value) {
          result.tags = value.split(',').map(t => t.trim()).filter(Boolean);
        }
        break;
      case '价格':
        result.price = value || undefined;
        break;
      case '评分':
        if (value) {
          const rating = parseFloat(value);
          if (!isNaN(rating)) {
            result.rating = rating;
          }
        }
        break;
      case '评价数':
        if (value) {
          const reviewCount = parseInt(value, 10);
          if (!isNaN(reviewCount)) {
            result.reviewCount = reviewCount;
          }
        }
        break;
      case '替代工具':
        if (value) {
          result.alternatives = value.split(',').map(a => a.trim()).filter(Boolean);
        }
        break;
      case '价格说明':
        result.priceInfo = value || undefined;
        break;
      case '使用限制':
        if (value) {
          result.limitations = value.split(';').map(l => l.trim()).filter(Boolean);
        }
        break;
    }
  }
  
  return result;
};

export const parseBookmarksHTML = (html: string): ParsedBookmark[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const bookmarks: ParsedBookmark[] = [];

  const parseNode = (node: Element, currentFolder: string = '未分类') => {
    const children = Array.from(node.children);

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.tagName === 'DT') {
        const h3 = child.querySelector('h3');
        const link = child.querySelector('a');
        const dl = child.querySelector('dl');

        if (h3 && dl) {
          const folderName = h3.textContent?.trim() || '未分类';
          parseNode(dl, folderName);
        } else if (link) {
          const url = link.getAttribute('href') || '';
          const title = link.textContent?.trim() || url;
          const addDateStr = link.getAttribute('add_date');
          const addDate = addDateStr ? parseInt(addDateStr, 10) * 1000 : undefined;

          let description: string | undefined;
          let category: string | undefined;
          let tags: string[] | undefined;
          let price: string | undefined;
          let rating: number | undefined;
          let reviewCount: number | undefined;
          let alternatives: string[] | undefined;
          let priceInfo: string | undefined;
          let limitations: string[] | undefined;
          
          const nextSibling = child.nextElementSibling;
          if (nextSibling && nextSibling.tagName === 'DD') {
            const ddContent = nextSibling.textContent?.trim() || '';
            if (ddContent) {
              const parsed = parseDDContent(ddContent);
              description = parsed.description;
              category = parsed.category;
              tags = parsed.tags;
              price = parsed.price;
              rating = parsed.rating;
              reviewCount = parsed.reviewCount;
              alternatives = parsed.alternatives;
              priceInfo = parsed.priceInfo;
              limitations = parsed.limitations;
            }
          }

          if (url && url.startsWith('http')) {
            bookmarks.push({
              title,
              name: title,
              url,
              folder: currentFolder,
              description,
              addDate,
              category,
              tags,
              price,
              rating,
              reviewCount,
              alternatives,
              priceInfo,
              limitations,
            });
          }
        }
      } else if (child.tagName === 'DL') {
        parseNode(child, currentFolder);
      }
    }
  };

  const rootDl = doc.querySelector('dl');
  if (rootDl) {
    parseNode(rootDl);
  }

  return bookmarks;
};

export const readBookmarkFile = (file: File): Promise<ParsedBookmark[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const bookmarks = parseBookmarksHTML(content);
        resolve(bookmarks);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
