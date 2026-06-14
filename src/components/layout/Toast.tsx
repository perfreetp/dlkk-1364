import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-brand-500" />,
};

const bgColors = {
  success: 'bg-emerald-50 border-emerald-200',
  error: 'bg-red-50 border-red-200',
  info: 'bg-brand-50 border-brand-200',
};

export const Toast: React.FC = () => {
  const toast = useUIStore((state) => state.toast);
  const hideToast = useUIStore((state) => state.hideToast);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast && !isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2">
      {toast && (
        <div
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in',
            bgColors[toast.type]
          )}
        >
          {icons[toast.type]}
          <span className="text-sm font-medium text-gray-800">{toast.message}</span>
          <button
            onClick={hideToast}
            className="ml-2 p-1 hover:bg-black/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
};
