'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BlockProps } from '../types';
import { TextBlock } from './TextBlock';
import { TableBlock } from './TableBlock';
import { BlockActions } from './BlockActions';
import { cn } from '@/lib/utils';

export const SortableBlock: React.FC<BlockProps> = ({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  isEditMode,
  onDoubleClick,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        'hover:bg-accent/5 rounded-lg transition-colors',
        isSelected && 'bg-accent/10'
      )}
      onDoubleClick={onDoubleClick}
    >
      <BlockActions
        onDelete={onDelete}
        isEditMode={isEditMode}
        dragActivators={listeners}
      />
      {block.type === 'text' && (
        <TextBlock
          block={block}
          onUpdate={onUpdate}
          isSelected={isSelected}
          onSelect={onSelect}
          isEditMode={isEditMode}
          onDelete={onDelete}
          onDoubleClick={onDoubleClick}
        />
      )}
      {block.type === 'table' && (
        <TableBlock
          block={block}
          onUpdate={onUpdate}
          isSelected={isSelected}
          onSelect={onSelect}
          isEditMode={isEditMode}
          onDelete={onDelete}
          onDoubleClick={onDoubleClick}
        />
      )}
    </div>
  );
}; 