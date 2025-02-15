'use client';

import React, { useState } from 'react';
import { BlockProps } from '../types';
import { Requirement } from '@/types/base/requirements.types';
import { RequirementFormat, RequirementLevel, RequirementPriority, RequirementStatus } from '@/types/base/enums.types';
import { useCreateRequirement, useUpdateRequirement } from '@/hooks/mutations/useRequirementMutations';
import { useAuth } from '@/hooks/useAuth';
import { MonospaceEditableTable, type EditableColumn } from '@/components/custom/BlockCanvas/components/EditableTable';
import { SidePanel } from '@/components/base/panels/SidePanel';
import { v4 as uuidv4 } from 'uuid';

export const TableBlock: React.FC<BlockProps> = ({
  block,
  isSelected,
  onSelect,
  isEditMode,
}) => {
  const createRequirementMutation = useCreateRequirement();
  const updateRequirementMutation = useUpdateRequirement();
  const { userProfile } = useAuth();
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [localRequirements, setLocalRequirements] = useState<Requirement[]>(block.requirements || []);
  
  // Update local requirements when block.requirements changes
  React.useEffect(() => {
    setLocalRequirements(block.requirements || []);
  }, [block.requirements]);

  const handleSaveRequirement = async (requirement: Requirement, isNew: boolean) => {
    if (!userProfile?.id) return;

    try {
      if (isNew) {
        // Generate a UUID for new requirements
        const tempId = uuidv4();
        const newRequirement = {
          ...requirement,
          id: tempId,
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
        };

        // Update local state optimistically
        setLocalRequirements(prev => [...prev, newRequirement]);

        // Make API call
        const savedRequirement = await createRequirementMutation.mutateAsync(newRequirement);
        
        // Update local state with the actual saved requirement
        setLocalRequirements(prev => 
          prev.map(req => req.id === tempId ? savedRequirement : req)
        );
      } else {
        // Update local state optimistically
        setLocalRequirements(prev =>
          prev.map(req => req.id === requirement.id ? requirement : req)
        );

        // Make API call
        await updateRequirementMutation.mutateAsync({
          ...requirement,
          updated_by: userProfile.id,
        });
      }
    } catch (error) {
      console.error('Failed to save requirement:', error);
      // Revert local state on error
      if (isNew) {
        setLocalRequirements(prev => prev.filter(req => req.id !== requirement.id));
      } else {
        setLocalRequirements(block.requirements || []);
      }
    }
  };

  const handleDeleteRequirement = async (requirement: Requirement) => {
    try {
      // Update local state optimistically
      setLocalRequirements(prev => prev.filter(req => req.id !== requirement.id));

      // Make API call
      await updateRequirementMutation.mutateAsync({
        ...requirement,
        is_deleted: true,
        updated_by: userProfile?.id,
      });
    } catch (error) {
      console.error('Failed to delete requirement:', error);
      // Revert local state on error
      setLocalRequirements(block.requirements || []);
    }
  };

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
      isSortable: true,
      required: true
    },
    {
      header: 'Status',
      accessor: 'status',
      type: 'select',
      options: Object.values(RequirementStatus),
      width: 120,
      isSortable: true,
      required: true
    }
  ];

  return (
    <div className="space-y-4">
      <MonospaceEditableTable
        data={localRequirements}
        columns={columns}
        onSave={handleSaveRequirement}
        onDelete={handleDeleteRequirement}
        emptyMessage="Click the 'New Row' below to add your first requirement."
        showFilter={true}
        isEditMode={isEditMode}
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
          if (option === 'delete' && selectedRequirement) {
            handleDeleteRequirement(selectedRequirement);
            setSelectedRequirement(null);
          }
        }}
      >
        {selectedRequirement && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">{selectedRequirement.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedRequirement.description}
              </p>
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
          </div>
        )}
      </SidePanel>
    </div>
  );
};