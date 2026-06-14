import React from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useToolStore } from '@/store/useToolStore';

export const ScreenshotViewer: React.FC = () => {
  const isOpen = useUIStore((state) => state.isScreenshotViewerOpen);
  const currentIndex = useUIStore((state) => state.currentScreenshotIndex);
  const toolId = useUIStore((state) => state.currentScreenshotToolId);
  const closeViewer = useUIStore((state) => state.closeScreenshotViewer);
  const setCurrentIndex = useUIStore((state) => state.setCurrentScreenshotIndex);
  const getToolById = useToolStore((state) => state.getToolById);

  const tool = toolId ? getToolById(toolId) : null;
  const screenshots = tool?.screenshots || [];

  if (!isOpen || screenshots.length === 0) return null;

  const currentScreenshot = screenshots[currentIndex];

  const handlePrev = () => {
    const newIndex = currentIndex === 0 ? screenshots.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex === screenshots.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') closeViewer();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={closeViewer}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <button
        onClick={closeViewer}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {screenshots.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <div
        className="relative max-w-5xl max-h-[85vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentScreenshot.url}
          alt={currentScreenshot.caption || tool?.name || 'Screenshot'}
          className="max-w-full max-h-[85vh] object-contain rounded-lg"
        />

        {currentScreenshot.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
            <p className="text-white text-center">{currentScreenshot.caption}</p>
          </div>
        )}

        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 rounded-full text-white text-sm">
          <ZoomIn className="w-4 h-4" />
          <span>
            {currentIndex + 1} / {screenshots.length}
          </span>
        </div>
      </div>

      {screenshots.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {screenshots.map((screenshot, idx) => (
            <button
              key={screenshot.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`w-16 h-10 rounded overflow-hidden border-2 transition-all ${
                idx === currentIndex
                  ? 'border-brand-500 scale-110'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={screenshot.url}
                alt={screenshot.caption || `Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
