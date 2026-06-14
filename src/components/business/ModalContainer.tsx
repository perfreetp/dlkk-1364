import React from 'react';
import { ToolForm } from '@/components/business/ToolForm';
import { BookmarkImporter } from '@/components/business/BookmarkImporter';
import { useUIStore } from '@/store/useUIStore';

export const ModalContainer: React.FC = () => {
  const isAddToolModalOpen = useUIStore((state) => state.isAddToolModalOpen);
  const isBookmarkImportModalOpen = useUIStore((state) => state.isBookmarkImportModalOpen);
  const closeAddToolModal = useUIStore((state) => state.closeAddToolModal);
  const closeBookmarkImportModal = useUIStore((state) => state.closeBookmarkImportModal);

  return (
    <>
      <ToolForm
        isOpen={isAddToolModalOpen}
        onClose={closeAddToolModal}
        onSuccess={closeAddToolModal}
        onCancel={closeAddToolModal}
      />
      <BookmarkImporter
        isOpen={isBookmarkImportModalOpen}
        onClose={closeBookmarkImportModal}
        onSuccess={closeBookmarkImportModal}
        onCancel={closeBookmarkImportModal}
      />
    </>
  );
};
