'use client';

import React, { useState } from 'react';
import { useDocumentStore } from '@/lib/store/document.store';
import { Block } from '@/types/base/documents.types';
import { Requirement } from '@/types/base/requirements.types';
import { RequirementFormat, RequirementLevel, RequirementPriority, RequirementStatus } from '@/types/base/enums.types';
import { Button } from '@/components/ui/button';
import { Plus, Table, Type, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Json } from '@/types/base/database.types';
import { MonospaceTable } from '@/components/base/MonospaceTable';
import type { Column } from '@/components/base/DashboardView';
import { MonospaceEditableTable, type EditableColumn } from '@/components/base/MonospaceEditableTable';
import { useCreateBlock, useUpdateBlock, useDeleteBlock } from '@/hooks/mutations/useBlockMutations';
import { useCreateRequirement, useUpdateRequirement } from '@/hooks/mutations/useRequirementMutations';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/queryKeys';
import { SidePanel } from '@/components/base/panels/SidePanel';

interface BlockContent {
  position?: number;
  text?: string;
  image?: string;
  requirements?: Requirement[];
}

interface BlockCanvasProps {
  documentId: string;
}

const TextBlock = ({ block, onUpdate }: { block: Block; onUpdate: (content: Json) => void }) => {
  const content = block.content as { text?: string };
  const [text, setText] = useState(content?.text || '');
  const [isFocused, setIsFocused] = useState(false);

  const handleBlur = () => {
    setIsFocused(false);
    if (text !== content?.text) {
      onUpdate({ text });
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.textContent || '';
    setText(newText);
  };

  return (
    <div className="relative">
      <div
        className="min-h-[2em] px-4 py-2 focus:outline-none empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)] focus:empty:before:content-none"
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        onFocus={handleFocus}
        onInput={handleInput}
        data-placeholder="Enter Text"
      >
        {content?.text}
      </div>
      {/* Future toolbar can be added here */}
      {isFocused && (
        <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          {/* Placeholder for future formatting buttons */}
        </div>
      )}
    </div>
  );
};

const TableBlock = ({ block, onUpdate }: { block: Block; onUpdate: (content: Json) => void }) => {
  const content = block.content as { requirements: Requirement[] };
  const requirements = content?.requirements || [];
  const createRequirementMutation = useCreateRequirement();
  const updateRequirementMutation = useUpdateRequirement();
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [isCreatingDefault, setIsCreatingDefault] = useState(false);
  const defaultCreationAttemptedRef = React.useRef(false);

  // Create default requirement when none exist
  React.useEffect(() => {
    const shouldCreateDefault = 
      !isCreatingDefault && 
      !defaultCreationAttemptedRef.current && 
      requirements.length === 0 && 
      userProfile?.id && 
      block.id;

    if (shouldCreateDefault) {
      const createDefaultRequirement = async () => {
        setIsCreatingDefault(true);
        defaultCreationAttemptedRef.current = true;
        
        try {
          const defaultRequirement = await createRequirementMutation.mutateAsync({
            name: 'New Requirement',
            description: 'Add description here',
            format: RequirementFormat.incose,
            level: RequirementLevel.system,
            priority: RequirementPriority.medium,
            status: RequirementStatus.draft,
            document_id: block.document_id,
            block_id: block.id,
            created_by: userProfile.id,
            updated_by: userProfile.id,
            ai_analysis: null,
            enchanced_requirement: null,
            external_id: null,
            original_requirement: null,
            tags: [],
          });

          onUpdate({ requirements: [defaultRequirement] });
        } catch (error) {
          console.error('Failed to create default requirement:', error);
          defaultCreationAttemptedRef.current = false;
        } finally {
          setIsCreatingDefault(false);
        }
      };

      createDefaultRequirement();
    }
  }, [
    block.id,
    block.document_id,
    requirements.length,
    userProfile?.id,
    isCreatingDefault,
    createRequirementMutation,
    onUpdate
  ]);

  const columns: EditableColumn<Requirement>[] = [
    {
      header: 'Name',
      accessor: 'name',
      type: 'text',
      width: 200,
      required: true,
      isSortable: true
    },
    {
      header: 'Description',
      accessor: 'description',
      type: 'text',
      width: 300,
    },
    {
      header: 'Priority',
      accessor: 'priority',
      type: 'select',
      options: Object.values(RequirementPriority),
      width: 120,
      isSortable: true
    },
    {
      header: 'Status',
      accessor: 'status',
      type: 'select',
      options: Object.values(RequirementStatus),
      width: 120,
      isSortable: true
    }
  ];

  const handleSaveRequirement = async (requirement: Requirement, isNew: boolean) => {
    if (!userProfile?.id) return;

    try {
      let savedRequirement;
      if (isNew) {
        // Create new requirement
        savedRequirement = await createRequirementMutation.mutateAsync({
          ...requirement,
          format: RequirementFormat.incose,
          level: RequirementLevel.system,
          document_id: block.document_id,
          block_id: block.id,
          created_by: userProfile.id,
          updated_by: userProfile.id,
          ai_analysis: null,
          enchanced_requirement: null,
          external_id: null,
          original_requirement: null,
          tags: [],
        });
      } else {
        // Update existing requirement
        savedRequirement = await updateRequirementMutation.mutateAsync({
          ...requirement,
          updated_by: userProfile.id,
        });
      }

      const updatedRequirements = isNew 
        ? [...requirements, savedRequirement]
        : requirements.map(req => req.id === requirement.id ? savedRequirement : req);

      onUpdate({ requirements: updatedRequirements });

      queryClient.invalidateQueries({
        queryKey: queryKeys.blocks.byDocument(block.document_id),
      });
    } catch (error) {
      console.error('Failed to save requirement:', error);
    }
  };

  const handleDeleteRequirement = async (requirement: Requirement) => {
    try {
      // Filter out the deleted requirement
      const updatedRequirements = requirements.filter(req => req.id !== requirement.id);
      onUpdate({ requirements: updatedRequirements });

      queryClient.invalidateQueries({
        queryKey: queryKeys.blocks.byDocument(block.document_id),
      });
    } catch (error) {
      console.error('Failed to delete requirement:', error);
    }
  };

  const handleRequirementClick = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
  };

  return (
    <div className="space-y-4">
      <MonospaceEditableTable
        data={requirements}
        columns={columns}
        onSave={handleSaveRequirement}
        onDelete={handleDeleteRequirement}
        emptyMessage="Click the 'New Row' below to add your first requirement."
        showFilter={true}
      />

      <SidePanel
        isOpen={!!selectedRequirement}
        onClose={() => setSelectedRequirement(null)}
        showNavigateButton={true}
        showEditButton={true}
        onNavigate={() => {
          // Navigate to requirement detail page
          // You'll need to implement this based on your routing structure
        }}
        onOptionSelect={(option) => {
          if (option === 'delete') {
            // Handle requirement deletion
            // You'll need to implement this
          }
        }}
      >
        {selectedRequirement && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">{selectedRequirement.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{selectedRequirement.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <p className="mt-1">{selectedRequirement.priority}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="mt-1">{selectedRequirement.status}</p>
              </div>
            </div>
            {/* Add more requirement details as needed */}
          </div>
        )}
      </SidePanel>
    </div>
  );
};

export function BlockCanvas({ documentId }: BlockCanvasProps) {
  const { blocks, addBlock, updateBlock, deleteBlock, moveBlock } = useDocumentStore();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const createBlockMutation = useCreateBlock();
  const updateBlockMutation = useUpdateBlock();
  const deleteBlockMutation = useDeleteBlock();
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  const handleAddBlock = async (type: 'text' | 'table') => {
    if (!userProfile?.id) return;

    const newBlock = {
      type,
      content: type === 'text' ? { text: '' } : { requirements: [] },
      position: blocks.length,
      document_id: documentId,
      created_by: userProfile.id,
      updated_by: userProfile.id,
    };

    try {
      const createdBlock = await createBlockMutation.mutateAsync(newBlock);
      addBlock(createdBlock);
    } catch (error) {
      console.error('Failed to create block:', error);
    }
  };

  const handleUpdateBlock = async (blockId: string, content: Json) => {
    if (!userProfile?.id) return;

    try {
      // Find the current block to get its version
      const currentBlock = blocks.find(b => b.id === blockId);
      if (!currentBlock) return;

      const updatedBlock = await updateBlockMutation.mutateAsync({
        id: blockId,
        content,
        updated_by: userProfile.id,
        version: (currentBlock.version || 1) + 1,
        updated_at: new Date().toISOString(),
      });
      
      updateBlock(blockId, content);
      
      // Invalidate relevant queries to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.blocks.byDocument(documentId),
      });
    } catch (error) {
      console.error('Failed to update block:', error);
      // If it's a version conflict, refetch the block
      if (error instanceof Error && error.message.includes('Concurrent update')) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.blocks.detail(blockId),
        });
      }
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!userProfile?.id) return;

    try {
      await deleteBlockMutation.mutateAsync({
        id: blockId,
        deletedBy: userProfile.id,
      });
      deleteBlock(blockId);
    } catch (error) {
      console.error('Failed to delete block:', error);
    }
  };

  const renderBlock = (block: Block) => {
    const isSelected = block.id === selectedBlockId;

    return (
      <div
        key={block.id}
        className={cn(
          'group relative rounded-lg border border-transparent transition-all hover:border-gray-200',
          isSelected && 'border-blue-500'
        )}
        onClick={() => setSelectedBlockId(block.id)}
      >
        {block.type === 'text' && (
          <TextBlock
            block={block}
            onUpdate={(content) => handleUpdateBlock(block.id, content)}
          />
        )}
        {block.type === 'table' && (
          <TableBlock 
            block={block}
            onUpdate={(content) => handleUpdateBlock(block.id, content)}
          />
        )}
        
        <div className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteBlock(block.id);
            }}
          >
            <Plus className="h-4 w-4 rotate-45" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-[500px] space-y-4">
      {blocks.map(renderBlock)}
      
      <div className="flex gap-2 mt-4 z-10 relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAddBlock('text')}
          className="gap-2 cursor-pointer"
        >
          <Type className="h-4 w-4" />
          Add Text
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAddBlock('table')}
          className="gap-2 cursor-pointer"
        >
          <Table className="h-4 w-4" />
          Add Requirements Table
        </Button>
      </div>
    </div>
  );
} 