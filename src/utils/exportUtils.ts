import type { Tool, Collection } from '@/types';
import { generateId } from './idGenerator';

export const exportToJSON = (
  tools: Tool[],
  collections: Collection[]
): string => {
  const data = {
    version: '1.0',
    exportedAt: Date.now(),
    tools,
    collections,
  };
  return JSON.stringify(data, null, 2);
};

export const exportToBookmarksHTML = (
  tools: Tool[],
  collections: Collection[]
): string => {
  const now = Math.floor(Date.now() / 1000);
  const getToolName = (id: string) => tools.find((t) => t.id === id)?.name || id;

  const formatBookmark = (tool: Tool): string => {
    let result = `            <DT><A HREF="${tool.url}" ADD_DATE="${now}">${tool.name}</A>`;
    const fields: string[] = [];
    
    if (tool.description) {
      fields.push(tool.description);
    }
    
    if (tool.category) {
      fields.push(`分类:${tool.category}`);
    }
    
    if (tool.tags && tool.tags.length > 0) {
      fields.push(`标签:${tool.tags.join(',')}`);
    }
    
    if (tool.price) {
      fields.push(`价格:${tool.price}`);
    }
    
    if (tool.rating !== undefined && tool.rating !== null) {
      fields.push(`评分:${tool.rating}`);
    }
    
    if (tool.reviewCount !== undefined && tool.reviewCount !== null) {
      fields.push(`评价数:${tool.reviewCount}`);
    }
    
    if (tool.alternatives && tool.alternatives.length > 0) {
      const altList = tool.alternatives.map((altId) => {
        const altTool = tools.find((t) => t.id === altId);
        if (altTool) {
          return `${altTool.name}|${altTool.url}`;
        }
        return getToolName(altId);
      }).join(',');
      fields.push(`替代工具:${altList}`);
    }
    
    if (tool.screenshots && tool.screenshots.length > 0) {
      const shotList = tool.screenshots.map((shot) => {
        if (shot.caption) {
          return `${shot.url}|${shot.caption}`;
        }
        return shot.url;
      }).join(',');
      fields.push(`截图:${shotList}`);
    }
    
    if (tool.id) {
      fields.push(`原始ID:${tool.id}`);
    }
    
    if (tool.priceInfo) {
      fields.push(`价格说明:${tool.priceInfo}`);
    }
    
    if (tool.limitations && tool.limitations.length > 0) {
      fields.push(`使用限制:${tool.limitations.join(';')}`);
    }
    
    if (fields.length > 0) {
      result += `\n            <DD>${fields.join(' ||| ')}</DD>`;
    }
    return result;
  };

  const formatFolder = (collection: Collection, allTools: Tool[]): string => {
    const folderTools = allTools.filter((t) => collection.toolIds.includes(t.id));
    const bookmarks = folderTools.map(formatBookmark).join('\n');

    return `        <DT><H3 ADD_DATE="${now}">${collection.name}</H3>
        <DL><p>
${bookmarks}
        </DL><p>`;
  };

  const unfiledTools = tools.filter(
    (t) => !collections.some((c) => c.toolIds.includes(t.id))
  );
  const unfiledBookmarks = unfiledTools.map(formatBookmark).join('\n');

  const collectionFolders = collections
    .map((c) => formatFolder(c, tools))
    .join('\n');

  return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>ToolBox Bookmarks</TITLE>
<H1>ToolBox Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="${now}">ToolBox 收藏夹</H3>
    <DL><p>
${collectionFolders}
        <DT><H3 ADD_DATE="${now}">未分类</H3>
        <DL><p>
${unfiledBookmarks}
        </DL><p>
    </DL><p>
</DL><p>`;
};

export const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const generateShareContent = (
  collection: Collection,
  tools: Tool[]
): string => {
  const collectionTools = tools.filter((t) => collection.toolIds.includes(t.id));
  const getToolName = (id: string) => tools.find((t) => t.id === id)?.name || id;

  const toolList = collectionTools
    .map((t, i) => {
      let line = `${i + 1}. ${t.name} - ${t.url}`;
      if (t.description) line += `\n   ${t.description}`;
      if (t.alternatives && t.alternatives.length > 0) {
        const altNames = t.alternatives.map(getToolName).join('、');
        line += `\n   🔄 替代工具：${altNames}`;
      }
      return line;
    })
    .join('\n\n');

  return `📦 ${collection.name}\n${collection.description}\n\n${toolList}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
};

export const createShareToken = (): string => {
  return generateId().replace(/-/g, '').slice(0, 12);
};
