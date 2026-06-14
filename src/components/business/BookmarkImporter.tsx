import React, { useState, useCallback } from 'react';
import { Upload, FileText, Check, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useCollectionStore } from '@/store/useCollectionStore';
import { useUIStore } from '@/store/useUIStore';
import type { ParsedBookmark } from '@/utils/bookmarkParser';
import { readBookmarkFile } from '@/utils/bookmarkParser';

interface BookmarkImporterProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type ImportStep = 'upload' | 'preview' | 'importing' | 'complete';

export const BookmarkImporter: React.FC<BookmarkImporterProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onCancel,
}) => {
  const [step, setStep] = useState<ImportStep>('upload');
  const [bookmarks, setBookmarks] = useState<ParsedBookmark[]>([]);
  const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(new Set());
  const [folders, setFolders] = useState<string[]>([]);
  const [importCount, setImportCount] = useState(0);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const importTools = useCollectionStore((state) => state.importTools);
  const showToast = useUIStore((state) => state.showToast);

  const handleFile = useCallback(async (file: File) => {
    setError('');
    try {
      const parsed = await readBookmarkFile(file);
      if (parsed.length === 0) {
        setError('未找到有效的书签链接');
        return;
      }

      const uniqueBookmarks = parsed.filter(
        (b, idx, arr) => arr.findIndex((x) => x.url === b.url) === idx
      );

      setBookmarks(uniqueBookmarks);
      setSelectedBookmarks(new Set(uniqueBookmarks.map((_, idx) => String(idx))));
      
      const uniqueFolders = Array.from(new Set(uniqueBookmarks.map((b) => b.folder)));
      setFolders(uniqueFolders);
      setStep('preview');
    } catch (e) {
      setError('文件解析失败，请确保是有效的浏览器书签导出文件');
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.html') || file.type === 'text/html')) {
        handleFile(file);
      } else {
        setError('请上传 HTML 格式的书签文件');
      }
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const toggleBookmark = (index: string) => {
    setSelectedBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedBookmarks(new Set(bookmarks.map((_, idx) => String(idx))));
  };

  const deselectAll = () => {
    setSelectedBookmarks(new Set());
  };

  const toggleFolder = (folder: string) => {
    const folderIndices = bookmarks
      .map((b, idx) => (b.folder === folder ? String(idx) : null))
      .filter((v): v is string => v !== null);

    const allSelected = folderIndices.every((idx) => selectedBookmarks.has(idx));
    
    setSelectedBookmarks((prev) => {
      const next = new Set(prev);
      folderIndices.forEach((idx) => {
        if (allSelected) {
          next.delete(idx);
        } else {
          next.add(idx);
        }
      });
      return next;
    });
  };

  const handleImport = async () => {
    const toImport = bookmarks.filter((_, idx) =>
      selectedBookmarks.has(String(idx))
    );

    if (toImport.length === 0) {
      showToast('请选择要导入的书签', 'error');
      return;
    }

    setStep('importing');
    
    const count = await importTools(toImport);
    setImportCount(count);
    setStep('complete');
    showToast(`成功导入 ${count} 个工具`, 'success');
    onSuccess?.();
  };

  const handleReset = () => {
    setStep('upload');
    setBookmarks([]);
    setSelectedBookmarks(new Set());
    setFolders([]);
    setImportCount(0);
    setError('');
  };

  const handleClose = () => {
    handleReset();
    onCancel?.();
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="导入浏览器书签"
      size="xl"
      footer={
        step === 'upload' ? (
          <Button variant="ghost" onClick={handleClose}>
            取消
          </Button>
        ) : step === 'preview' ? (
          <>
            <Button variant="ghost" onClick={handleReset}>
              重新选择
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              icon={<Upload className="w-4 h-4" />}
            >
              导入选中 ({selectedBookmarks.size})
            </Button>
          </>
        ) : step === 'complete' ? (
          <Button variant="primary" onClick={handleClose}>
            完成
          </Button>
        ) : null
      }
    >
      {step === 'upload' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
            isDragging
              ? 'border-brand-500 bg-brand-50'
              : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
          }`}
          onClick={() => document.getElementById('bookmark-file-input')?.click()}
        >
          <input
            id="bookmark-file-input"
            type="file"
            accept=".html,text/html"
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-100 flex items-center justify-center">
            <FileText className="w-8 h-8 text-brand-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            拖放书签文件到此处
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            或点击选择文件，支持 Chrome、Firefox、Edge 等浏览器导出的 HTML 书签文件
          </p>
          <Button variant="outline" size="sm">
            选择文件
          </Button>
          {error && (
            <div className="mt-4 flex items-center justify-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      )}

      {step === 'preview' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">
                共找到 <span className="font-semibold text-gray-900">{bookmarks.length}</span> 个书签，
                已选择 <span className="font-semibold text-brand-600">{selectedBookmarks.size}</span> 个
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                全选
              </Button>
              <Button variant="ghost" size="sm" onClick={deselectAll}>
                取消全选
              </Button>
            </div>
          </div>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {folders.map((folder) => {
              const folderBookmarks = bookmarks
                .map((b, idx) => ({ ...b, idx: String(idx) }))
                .filter((b) => b.folder === folder);
              
              const folderSelectedCount = folderBookmarks.filter((b) =>
                selectedBookmarks.has(b.idx)
              ).length;
              const allSelected = folderSelectedCount === folderBookmarks.length;

              return (
                <div key={folder} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div
                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => toggleFolder(folder)}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span className="font-medium text-gray-900">{folder}</span>
                    <span className="ml-auto text-sm text-gray-500">
                      {folderSelectedCount}/{folderBookmarks.length}
                    </span>
                  </div>
                  <div className="p-2 space-y-1">
                    {folderBookmarks.map((bookmark) => (
                      <label
                        key={bookmark.idx}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBookmarks.has(bookmark.idx)}
                          onChange={() => toggleBookmark(bookmark.idx)}
                          className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {bookmark.title}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {bookmark.url}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 'importing' && (
        <div className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-lg font-medium text-gray-900 mb-1">正在导入...</p>
          <p className="text-sm text-gray-500">请稍候，正在处理您的书签</p>
        </div>
      )}

      {step === 'complete' && (
        <div className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-1">导入完成！</p>
          <p className="text-sm text-gray-500 mb-4">
            成功导入 <span className="font-semibold text-emerald-600">{importCount}</span> 个工具到您的收藏夹
          </p>
          {bookmarks.length - importCount > 0 && (
            <p className="text-sm text-amber-600">
              {bookmarks.length - importCount} 个因重复已跳过
            </p>
          )}
        </div>
      )}
    </Modal>
  );
};
