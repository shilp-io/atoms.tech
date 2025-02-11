import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/supabaseBrowser';
import { queryKeys } from '@/lib/constants/queryKeys';
import { Block } from '@/types';
import { BlockSchema } from '@/types/validation/blocks.validation';
import { useDocumentStore } from '@/lib/store/document.store';

export type CreateBlockInput = Omit<
    Block,
    | 'id'
    | 'created_at'
    | 'updated_at'
    | 'deleted_at'
    | 'deleted_by'
    | 'is_deleted'
    | 'version'
>;

export function useCreateBlock() {
    const queryClient = useQueryClient();
    const { addBlock } = useDocumentStore();
    
    return useMutation({
        mutationFn: async (input: CreateBlockInput) => {
            console.log('Creating block', input);
            
            const { data: block, error: blockError } = await supabase
                .from('blocks')
                .insert({
                    content: input.content,
                    document_id: input.document_id,
                    position: input.position,
                    type: input.type,
                    created_by: input.created_by,
                    updated_by: input.updated_by,
                })
                .select()
                .single();

            if (blockError) {
                console.error('Failed to create block', blockError);
                throw blockError;
            }

            if (!block) {
                throw new Error('Failed to create block');
            }

            return BlockSchema.parse(block);
        },
        onMutate: async (newBlock) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ 
                queryKey: queryKeys.blocks.byDocument(newBlock.document_id)
            });

            // Snapshot the previous value
            const previousBlocks = queryClient.getQueryData<Block[]>(
                queryKeys.blocks.byDocument(newBlock.document_id)
            );

            // Optimistically update the store and cache
            const optimisticBlock = {
                ...newBlock,
                id: `temp-${Date.now()}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                version: 1,
            } as Block;

            addBlock(optimisticBlock);

            queryClient.setQueryData<Block[]>(
                queryKeys.blocks.byDocument(newBlock.document_id),
                old => [...(old || []), optimisticBlock]
            );

            return { previousBlocks };
        },
        onError: (err, newBlock, context) => {
            // Revert the optimistic update
            if (context?.previousBlocks) {
                queryClient.setQueryData(
                    queryKeys.blocks.byDocument(newBlock.document_id),
                    context.previousBlocks
                );
            }
        },
        onSuccess: (data) => {
            invalidateBlockQueries(queryClient, data);
        },
    });
}

export function useUpdateBlock() {
    const queryClient = useQueryClient();
    const { updateBlock } = useDocumentStore();
    
    return useMutation({
        mutationFn: async ({ id, ...input }: Partial<Block> & { id: string }) => {
            console.log('Updating block', id, input);
            
            const { data: block, error: blockError } = await supabase
                .from('blocks')
                .update({
                    ...input,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (blockError) {
                console.error('Failed to update block', blockError);
                throw blockError;
            }

            if (!block) {
                throw new Error('Failed to update block');
            }

            return BlockSchema.parse(block);
        },
        onMutate: async ({ id, ...updates }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ 
                queryKey: queryKeys.blocks.detail(id)
            });

            // Snapshot the previous value
            const previousBlock = queryClient.getQueryData<Block>(
                queryKeys.blocks.detail(id)
            );

            // Optimistically update the store and cache
            const optimisticBlock = {
                ...previousBlock,
                ...updates,
                updated_at: new Date().toISOString(),
            } as Block;

            updateBlock(id, optimisticBlock.content);

            queryClient.setQueryData<Block>(
                queryKeys.blocks.detail(id),
                optimisticBlock
            );

            return { previousBlock };
        },
        onError: (err, { id }, context) => {
            // Revert the optimistic update
            if (context?.previousBlock) {
                queryClient.setQueryData(
                    queryKeys.blocks.detail(id),
                    context.previousBlock
                );
                updateBlock(id, context.previousBlock.content);
            }
        },
        onSuccess: (data) => {
            invalidateBlockQueries(queryClient, data);
        },
    });
}

export function useDeleteBlock() {
    const queryClient = useQueryClient();
    const { deleteBlock } = useDocumentStore();
    
    return useMutation({
        mutationFn: async ({ id, deletedBy }: { id: string; deletedBy: string }) => {
            console.log('Deleting block', id);
            
            const { data: block, error: blockError } = await supabase
                .from('blocks')
                .update({
                    is_deleted: true,
                    deleted_at: new Date().toISOString(),
                    deleted_by: deletedBy,
                })
                .eq('id', id)
                .select()
                .single();

            if (blockError) {
                console.error('Failed to delete block', blockError);
                throw blockError;
            }

            if (!block) {
                throw new Error('Failed to delete block');
            }

            return BlockSchema.parse(block);
        },
        onMutate: async ({ id }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ 
                queryKey: queryKeys.blocks.detail(id)
            });

            // Snapshot the previous value
            const previousBlock = queryClient.getQueryData<Block>(
                queryKeys.blocks.detail(id)
            );

            // Optimistically update the store and cache
            deleteBlock(id);

            queryClient.setQueryData<Block[]>(
                queryKeys.blocks.list({}),
                old => old?.filter(block => block.id !== id) || []
            );

            return { previousBlock };
        },
        onError: (err, { id }, context) => {
            // Revert the optimistic update
            if (context?.previousBlock) {
                queryClient.setQueryData(
                    queryKeys.blocks.detail(id),
                    context.previousBlock
                );
                // Re-add the block to the store
                const { addBlock } = useDocumentStore.getState();
                addBlock(context.previousBlock);
            }
        },
        onSuccess: (data) => {
            invalidateBlockQueries(queryClient, data);
        },
    });
}

const invalidateBlockQueries = (queryClient: QueryClient, data: Block) => {
    queryClient.invalidateQueries({
        queryKey: queryKeys.blocks.list({}),
    });
    queryClient.invalidateQueries({
        queryKey: queryKeys.blocks.detail(data.id),
    });
    queryClient.invalidateQueries({
        queryKey: queryKeys.blocks.byDocument(data.document_id),
    });
};
