export interface ParsedBookmark {
  title: string;
  name: string;
  url: string;
  folder: string;
  description?: string;
  addDate?: number;
}

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
          const nextSibling = child.nextElementSibling;
          if (nextSibling && nextSibling.tagName === 'DD') {
            description = nextSibling.textContent?.trim() || undefined;
          }

          if (url && url.startsWith('http')) {
            bookmarks.push({
              title,
              name: title,
              url,
              folder: currentFolder,
              description,
              addDate,
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
