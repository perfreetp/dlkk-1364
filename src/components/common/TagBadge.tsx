import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagBadgeProps {
  label: string;
  color?: string;
  size?: 'sm' | 'md';
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  green: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  red: 'bg-red-100 text-red-700 hover:bg-red-200',
  purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  pink: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
  cyan: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
  orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  teal: 'bg-teal-100 text-teal-700 hover:bg-teal-200',
  indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
};

export const TagBadge: React.FC<TagBadgeProps> = ({
  label,
  color = 'blue',
  size = 'md',
  removable = false,
  onRemove,
  onClick,
  selected = false,
  className,
}) => {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
  };

  const baseColor = colorMap[color] || colorMap.blue;
  const selectedColor = selected
    ? 'bg-brand-600 text-white hover:bg-brand-700'
    : baseColor;

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full transition-all duration-150',
        selectedColor,
        sizes[size],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {label}
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
        >
          <X className={cn(size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
        </button>
      )}
    </span>
  );
};
