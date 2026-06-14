import React from 'react';
import { Wrench, Search, Inbox, Star, FolderOpen, GitCompare, FileText, Clock, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyProps {
  icon?: 'tool' | 'search' | 'inbox' | 'star' | 'folder' | 'compare' | 'note' | 'clock' | 'bell';
  title?: string;
  description?: string;
  className?: string;
}

const iconMap = {
  tool: Wrench,
  search: Search,
  inbox: Inbox,
  star: Star,
  folder: FolderOpen,
  compare: GitCompare,
  note: FileText,
  clock: Clock,
  bell: Bell,
};

function Empty({ icon = 'inbox', title = '暂无数据', description, className }: EmptyProps) {
  const Icon = iconMap[icon];
  
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm">{description}</p>
      )}
    </div>
  );
}

export default Empty;
export { Empty };
