import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/supabaseBrowser';
import { queryKeys } from '@/lib/constants/queryKeys';
import { Block } from '@/types';
import { BlockSchema } from '@/types/validation/blocks.validation';

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
        onSuccess: (data) => {
            invalidateBlockQueries(queryClient, data);
        },
    });
}

export function useUpdateBlock() {
    const queryClient = useQueryClient();
    
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
        onSuccess: (data) => {
            invalidateBlockQueries(queryClient, data);
        },
    });
}

export function useDeleteBlock() {
    const queryClient = useQueryClient();
    
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
