import { queryKeys } from '@/lib/constants/queryKeys';
import { supabase } from '@/lib/supabase/supabaseBrowser';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUploadExternalDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ file, orgId }: { file: File; orgId: string }) => {
            const filePath = `external_documents/${file.name}`;
            const { data, error } = await supabase.storage
                .from('external_documents')
                .upload(filePath, file);

            if (error) throw error;

            const { data: document, error: documentError } = await supabase
                .from('external_documents')
                .insert({
                    name: file.name,
                    type: file.type,
                    url: data.path,
                    org_id: orgId, 
                })
                //.single();

            if (documentError) throw documentError;
            return document;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.externalDocuments.all,
            });
        },
    });
}

export function useDeleteExternalDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (documentId: string) => {
            const { data, error } = await supabase
                .from('external_documents')
                .delete()
                .eq('id', documentId);

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.externalDocuments.all,
            });
        },
    });
}