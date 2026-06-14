import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
  className,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (index: number) => {
    if (!readonly && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            onMouseEnter={() => !readonly && setHoverValue(index + 1)}
            onMouseLeave={() => !readonly && setHoverValue(null)}
            disabled={readonly}
            className={cn(
              'transition-all duration-150',
              !readonly && 'cursor-pointer hover:scale-110',
              readonly && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                sizes[size],
                'transition-colors duration-150',
                index < displayValue
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-300'
              )}
            />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-gray-600 ml-2">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};
