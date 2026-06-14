import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  bordered?: boolean;
}

interface CardComponent extends React.FC<CardProps> {
  Header: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  Body: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  Footer: React.FC<React.HTMLAttributes<HTMLDivElement>>;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  children,
  hoverable = false,
  bordered = true,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-white rounded-xl overflow-hidden',
        bordered && 'border border-gray-200',
        hoverable && 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}) as unknown as CardComponent;

Card.displayName = 'Card';

Card.Header = function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-100', className)} {...props}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-4 bg-gray-50 border-t border-gray-100', className)} {...props}>
      {children}
    </div>
  );
};
