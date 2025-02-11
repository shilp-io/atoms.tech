import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/supabaseBrowser';
import { queryKeys } from '@/lib/constants/queryKeys';
import { Requirement } from '@/types';
import { RequirementSchema } from '@/types/validation/requirements.validation';

export type CreateRequirementInput = Omit<
    Requirement,
    | 'id'
    | 'created_at'
    | 'updated_at'
    | 'deleted_at'
    | 'deleted_by'
    | 'is_deleted'
    | 'version'
>;

export function useCreateRequirement() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (input: CreateRequirementInput) => {
            console.log('Creating requirement', input);
            
            const { data: requirement, error: requirementError } = await supabase
                .from('requirements')
                .insert({
                    ai_analysis: input.ai_analysis,
                    block_id: input.block_id,
                    description: input.description,
                    document_id: input.document_id,
                    enchanced_requirement: input.enchanced_requirement,
                    external_id: input.external_id,
                    format: input.format,
                    level: input.level,
                    name: input.name,
                    original_requirement: input.original_requirement,
                    priority: input.priority,
                    status: input.status,
                    tags: input.tags,
                    created_by: input.created_by,
                    updated_by: input.updated_by,
                })
                .select()
                .single();

            if (requirementError) {
                console.error('Failed to create requirement', requirementError);
                throw requirementError;
            }

            if (!requirement) {
                throw new Error('Failed to create requirement');
            }

            return RequirementSchema.parse(requirement);
        },
        onMutate: async (newRequirement) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ 
                queryKey: queryKeys.requirements.byBlock(newRequirement.block_id)
            });

            // Snapshot the previous value
            const previousRequirements = queryClient.getQueryData<Requirement[]>(
                queryKeys.requirements.byBlock(newRequirement.block_id)
            );

            // Optimistically update the cache
            const optimisticRequirement = {
                ...newRequirement,
                id: `temp-${Date.now()}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                version: 1,
            } as Requirement;

            queryClient.setQueryData<Requirement[]>(
                queryKeys.requirements.byBlock(newRequirement.block_id),
                old => [...(old || []), optimisticRequirement]
            );

            // Also update the document's block content
            const block = queryClient.getQueryData<any>(
                queryKeys.blocks.detail(newRequirement.block_id)
            );
            if (block) {
                const updatedContent = {
                    ...block.content,
                    requirements: [...(block.content.requirements || []), optimisticRequirement],
                };
                queryClient.setQueryData(
                    queryKeys.blocks.detail(newRequirement.block_id),
                    { ...block, content: updatedContent }
                );
            }

            return { previousRequirements };
        },
        onError: (err, newRequirement, context) => {
            // Revert the optimistic update
            if (context?.previousRequirements) {
                queryClient.setQueryData(
                    queryKeys.requirements.byBlock(newRequirement.block_id),
                    context.previousRequirements
                );
            }
        },
        onSuccess: (data) => {
            invalidateRequirementQueries(queryClient, data);
        },
    });
}

export function useUpdateRequirement() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ id, ...input }: Partial<Requirement> & { id: string }) => {
            console.log('Updating requirement', id, input);
            
            const { data: requirement, error: requirementError } = await supabase
                .from('requirements')
                .update({
                    ...input,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (requirementError) {
                console.error('Failed to update requirement', requirementError);
                throw requirementError;
            }

            if (!requirement) {
                throw new Error('Failed to update requirement');
            }

            return RequirementSchema.parse(requirement);
        },
        onMutate: async ({ id, ...updates }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ 
                queryKey: queryKeys.requirements.detail(id)
            });

            // Snapshot the previous value
            const previousRequirement = queryClient.getQueryData<Requirement>(
                queryKeys.requirements.detail(id)
            );

            if (!previousRequirement) return { previousRequirement: null };

            // Optimistically update the cache
            const optimisticRequirement = {
                ...previousRequirement,
                ...updates,
                updated_at: new Date().toISOString(),
            };

            queryClient.setQueryData(
                queryKeys.requirements.detail(id),
                optimisticRequirement
            );

            // Also update in the block's requirements list
            const blockId = previousRequirement.block_id;
            const block = queryClient.getQueryData<any>(
                queryKeys.blocks.detail(blockId)
            );
            if (block) {
                const updatedContent = {
                    ...block.content,
                    requirements: block.content.requirements.map((req: Requirement) =>
                        req.id === id ? optimisticRequirement : req
                    ),
                };
                queryClient.setQueryData(
                    queryKeys.blocks.detail(blockId),
                    { ...block, content: updatedContent }
                );
            }

            return { previousRequirement };
        },
        onError: (err, { id }, context) => {
            // Revert the optimistic update
            if (context?.previousRequirement) {
                queryClient.setQueryData(
                    queryKeys.requirements.detail(id),
                    context.previousRequirement
                );
            }
        },
        onSuccess: (data) => {
            invalidateRequirementQueries(queryClient, data);
        },
    });
}

export function useDeleteRequirement() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ id, deletedBy }: { id: string; deletedBy: string }) => {
            console.log('Deleting requirement', id);
            
            const { data: requirement, error: requirementError } = await supabase
                .from('requirements')
                .update({
                    is_deleted: true,
                    deleted_at: new Date().toISOString(),
                    deleted_by: deletedBy,
                })
                .eq('id', id)
                .select()
                .single();

            if (requirementError) {
                console.error('Failed to delete requirement', requirementError);
                throw requirementError;
            }

            if (!requirement) {
                throw new Error('Failed to delete requirement');
            }

            return RequirementSchema.parse(requirement);
        },
        onMutate: async ({ id }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ 
                queryKey: queryKeys.requirements.detail(id)
            });

            // Snapshot the previous value
            const previousRequirement = queryClient.getQueryData<Requirement>(
                queryKeys.requirements.detail(id)
            );

            if (!previousRequirement) return { previousRequirement: null };

            // Optimistically update the cache
            queryClient.setQueryData<Requirement[]>(
                queryKeys.requirements.list({}),
                old => old?.filter(req => req.id !== id) || []
            );

            // Also update in the block's requirements list
            const blockId = previousRequirement.block_id;
            const block = queryClient.getQueryData<any>(
                queryKeys.blocks.detail(blockId)
            );
            if (block) {
                const updatedContent = {
                    ...block.content,
                    requirements: block.content.requirements.filter(
                        (req: Requirement) => req.id !== id
                    ),
                };
                queryClient.setQueryData(
                    queryKeys.blocks.detail(blockId),
                    { ...block, content: updatedContent }
                );
            }

            return { previousRequirement };
        },
        onError: (err, { id }, context) => {
            // Revert the optimistic update
            if (context?.previousRequirement) {
                queryClient.setQueryData(
                    queryKeys.requirements.detail(id),
                    context.previousRequirement
                );
            }
        },
        onSuccess: (data) => {
            invalidateRequirementQueries(queryClient, data);
        },
    });
}

const invalidateRequirementQueries = (queryClient: QueryClient, data: Requirement) => {
    queryClient.invalidateQueries({
        queryKey: queryKeys.requirements.list({}),
    });
    queryClient.invalidateQueries({
        queryKey: queryKeys.requirements.detail(data.id),
    });
    queryClient.invalidateQueries({
        queryKey: queryKeys.requirements.byDocument(data.document_id),
    });
    queryClient.invalidateQueries({
        queryKey: queryKeys.requirements.byBlock(data.block_id),
    });
};
