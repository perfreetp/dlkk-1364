import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  className,
  id,
  ...props
}) => {
  const inputId = id || React.useId();

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full px-4 py-2.5 text-sm bg-white border rounded-lg transition-all duration-200',
            'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0',
            icon && iconPosition === 'left' && 'pl-10',
            icon && iconPosition === 'right' && 'pr-10',
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-brand-500 focus:border-brand-500 hover:border-gray-400',
            className
          )}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
      </div>
      {hint && !error && (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      )}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  hint,
  className,
  id,
  rows = 4,
  ...props
}) => {
  const inputId = id || React.useId();

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={cn(
          'w-full px-4 py-2.5 text-sm bg-white border rounded-lg transition-all duration-200 resize-y',
          'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-brand-500 focus:border-brand-500 hover:border-gray-400',
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      )}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  hint,
  options,
  className,
  id,
  ...props
}) => {
  const inputId = id || React.useId();

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'w-full px-4 py-2.5 text-sm bg-white border rounded-lg transition-all duration-200 appearance-none cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'bg-no-repeat bg-right',
          error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-brand-500 focus:border-brand-500 hover:border-gray-400',
          className
        )}
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem' }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && !error && (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      )}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
};
