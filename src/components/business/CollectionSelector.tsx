import React, { useState } from 'react';
import { BookmarkPlus, Check, FolderPlus, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { useCollectionStore } from '@/store/useCollectionStore';
import { useUIStore } from '@/store/useUIStore';
import { useToolStore } from '@/store/useToolStore';
import type { Collection } from '@/types';

interface CollectionSelectorProps {
  toolId: string;
  trigger?: React.ReactNode;
}

export const CollectionSelector: React.FC<CollectionSelectorProps> = ({
  toolId,
  trigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');

  const collections = useCollectionStore((state) => state.collections);
  const addCollection = useCollectionStore((state) => state.addCollection);
  const addToolToCollection = useCollectionStore((state) => state.addToolToCollection);
  const removeToolFromCollection = useCollectionStore((state) => state.removeToolFromCollection);
  const getCollectionsForTool = useCollectionStore((state) => state.getCollectionsForTool);
  const showToast = useUIStore((state) => state.showToast);
  const getToolById = useToolStore((state) => state.getToolById);

  const tool = getToolById(toolId);
  const toolCollections = getCollectionsForTool(toolId);

  const isInCollection = (collectionId: string) => {
    return toolCollections.some((c) => c.id === collectionId);
  };

  const toggleCollection = (collection: Collection) => {
    if (isInCollection(collection.id)) {
      removeToolFromCollection(collection.id, toolId);
      showToast(`已从「${collection.name}」移除`, 'info');
    } else {
      addToolToCollection(collection.id, toolId);
      showToast(`已添加到「${collection.name}」`, 'success');
    }
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      showToast('请输入收藏夹名称', 'error');
      return;
    }

    const newCollection = addCollection({
      name: newCollectionName.trim(),
      description: newCollectionDesc.trim(),
      isPublic: false,
    });

    addToolToCollection(newCollection.id, toolId);
    showToast(`已创建并添加到「${newCollection.name}」`, 'success');

    setNewCollectionName('');
    setNewCollectionDesc('');
    setShowNewCollection(false);
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => setIsOpen(true)}>{trigger}</span>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="添加到收藏夹"
        >
          <BookmarkPlus className="w-4 h-4 text-gray-500" />
        </button>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setShowNewCollection(false);
        }}
        title="添加到收藏夹"
        size="sm"
      >
        <div className="space-y-4">
          {tool && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                {tool.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{tool.name}</p>
                <p className="text-sm text-gray-500 truncate">{tool.url}</p>
              </div>
            </div>
          )}

          {!showNewCollection ? (
            <>
              {collections.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <FolderPlus className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">还没有收藏夹</p>
                  <Button variant="primary" onClick={() => setShowNewCollection(true)}>
                    创建第一个收藏夹
                  </Button>
                </div>
              ) : (
                <>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {collections.map((collection) => (
                      <button
                        key={collection.id}
                        onClick={() => toggleCollection(collection)}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                            <BookmarkPlus className="w-5 h-5 text-brand-600" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{collection.name}</p>
                            <p className="text-sm text-gray-500">
                              {collection.toolIds.length} 个工具
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isInCollection(collection.id)
                              ? 'bg-brand-500 border-brand-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {isInCollection(collection.id) && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowNewCollection(true)}
                    leftIcon={<FolderPlus className="w-4 h-4" />}
                  >
                    新建收藏夹
                  </Button>
                </>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <Input
                label="收藏夹名称"
                placeholder="例如：UI 设计工具集"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                autoFocus
              />
              <Input
                label="描述（可选）"
                placeholder="简单描述这个收藏夹的用途"
                value={newCollectionDesc}
                onChange={(e) => setNewCollectionDesc(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowNewCollection(false)}
                  leftIcon={<X className="w-4 h-4" />}
                >
                  取消
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleCreateCollection}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  创建
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
