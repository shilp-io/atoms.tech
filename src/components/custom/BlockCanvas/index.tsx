'use client';

import React, { useState, useCallback } from 'react';
import { useDocumentStore } from '@/lib/store/document.store';
import { Block } from '@/types/base/documents.types';
import { Button } from '@/components/ui/button';
import { Table, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentRealtime } from '@/hooks/queries/useDocumentRealtime';
import { BlockCanvasProps, BlockWithRequirements } from './types';
import { useBlockActions } from './hooks/useBlockActions';
import { TextBlock } from './components/TextBlock';
import { TableBlock } from './components/TableBlock';
import { BlockActions } from './components/BlockActions';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { EditModeToggle } from './components/EditModeToggle';
import { SortableBlock } from './components/SortableBlock';

export function BlockCanvas({ documentId }: BlockCanvasProps) {
  const { blocks, isLoading, setLocalBlocks } = useDocumentRealtime(documentId);
  const { reorderBlocks } = useDocumentStore();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { userProfile } = useAuth();
  const { handleAddBlock, handleUpdateBlock, handleDeleteBlock, handleReorder } = useBlockActions({
    documentId,
    userProfile,
    blocks,
    setLocalBlocks,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const renderBlock = useCallback((block: BlockWithRequirements) => {
    const isSelected = block.id === selectedBlockId;

    return (
      <SortableBlock
        key={block.id}
        block={block}
        isSelected={isSelected}
        isEditMode={isEditMode}
        onSelect={() => setSelectedBlockId(block.id)}
        onUpdate={(content) => handleUpdateBlock(block.id, content)}
        onDelete={() => handleDeleteBlock(block.id)}
        onDoubleClick={() => {
          setSelectedBlockId(block.id);
          setIsEditMode(true);
        }}
      />
    );
  }, [selectedBlockId, isEditMode, handleUpdateBlock, handleDeleteBlock]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id || !blocks) {
      return;
    }

    const oldIndex = blocks.findIndex((block) => block.id === active.id);
    const newIndex = blocks.findIndex((block) => block.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newBlocks = arrayMove(blocks, oldIndex, newIndex).map((block, index) => ({
        ...block,
        position: index,
      }));
      
      // Update local state immediately for smooth UI
      setLocalBlocks(newBlocks);
      
      // Update document store
      reorderBlocks(newBlocks);
      
      // Trigger server update
      handleReorder(newBlocks);
    }
  };

  // Don't render blocks until they're loaded
  if (isLoading) {
    return (
      <div className="relative min-h-[500px] space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded-lg" />
          <div className="h-24 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[500px] space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks?.map(block => block.id) || []}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {blocks?.map(block => renderBlock(block))}
          </div>
        </SortableContext>
      </DndContext>
      
      {!isEditMode && (
        <div className="flex gap-2 mt-4 z-10 relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddBlock('text', { format: 'markdown', text: '' })}
            className="gap-2 cursor-pointer"
          >
            <Type className="h-4 w-4" />
            Add Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddBlock('table', { requirements: [] })}
            className="gap-2 cursor-pointer"
          >
            <Table className="h-4 w-4" />
            Add Requirements Table
          </Button>
        </div>
      )}

      <EditModeToggle
        isEditMode={isEditMode}
        onToggle={() => setIsEditMode(!isEditMode)}
      />
    </div>
  );
}