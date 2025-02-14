'use client';

import React, { useRef, useEffect } from 'react';
import { BlockProps } from '../types';
import { Json } from '@/types/base/database.types';
import { cn } from '@/lib/utils';

export const TextBlock: React.FC<BlockProps> = ({ block, onUpdate, isSelected, onSelect, isEditMode }) => {
  const content = block.content as { text?: string; format?: string };
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.textContent = content?.text || '';
    }
  }, [content?.text]);

  const handleBlur = () => {
    if (!contentRef.current) return;
    const newText = contentRef.current.textContent || '';
    if (newText !== (content?.text || '')) {
      onUpdate({ text: newText, format: content?.format || 'markdown' } as Json);
    }
  };

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className={cn(
          "min-h-[2em] px-4 py-2 focus:outline-none",
          "empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)]",
          "focus:empty:before:content-none",
          !isEditMode && "pointer-events-none"
        )}
        contentEditable={isEditMode}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onFocus={onSelect}
        data-placeholder="Enter Text"
      />
    </div>
  );
}; 