'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Upload, Trash, List, Grid } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useDeleteExternalDocument, useUploadExternalDocument } from '@/hooks/mutations/useExternalDocumentsMutations';
import { useExternalDocumentsByOrg } from '@/hooks/queries/useExternalDocuments';
import { motion } from 'framer-motion';

export default function ExternalDocsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const { theme } = useTheme();
    const uploadDocument = useUploadExternalDocument();
    const deleteDocument = useDeleteExternalDocument();

    // Get the current org_id using the slugs
    const pathname = usePathname();
    const currentOrgId = pathname?.split('/').slice(-2, -1)[0];

    // Fetch files using useExternalDocumentsByOrg
    const { data: files = [], refetch } = useExternalDocumentsByOrg(currentOrgId as string);

    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                await uploadDocument.mutateAsync({ file, orgId: currentOrgId as string });
                refetch(); // Refresh the file list after upload
                alert('File uploaded successfully!');
            } catch (error) {
                console.error('Failed to upload document', error);
                alert('Failed to upload document.');
            }
        }
    };

    // Handle file deletion
    const handleFileDelete = async (documentId: string) => {
        try {
            await deleteDocument.mutateAsync(documentId);
            refetch(); // Refresh the file list after deletion
            alert('File deleted successfully!');
        } catch (error) {
            console.error('Failed to delete document', error);
            alert('Failed to delete document.');
        }
    };

    // Filter files based on search term
    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container p-6">
            <div className="mb-4 flex justify-between items-center">
                <div className="flex space-x-2">
                    <Input
                        type="text"
                        placeholder="Search files..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                    <Button variant="default" className="w-9 h-9" onClick={() => console.log('Filter button clicked')}>
                        <Filter className="w-4 h-4" />
                    </Button>
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        id="file-upload"
                    />
                    <label htmlFor="file-upload">
                        <Button variant="default" className="w-9 h-9" onClick={() => document.getElementById('file-upload')?.click()}>
                            <Upload className="w-4 h-4" />
                        </Button>
                    </label>
                </div>
                <div className="relative flex space-x-0">
                    <motion.div
                        className="absolute inset-0 bg-accent"
                        layout
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{
                            left: viewMode === 'list' ? 0 : '50%',
                            width: '50%',
                        }}
                    />
                    <Button
                        variant="link"
                        className={`w-9 h-9 relative z-10 ${viewMode === 'list' ? 'text-white' : theme === 'dark' ? 'text-white' : 'text-black'}`}
                        onClick={() => setViewMode('list')}
                    >
                        <List className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="link"
                        className={`w-9 h-9 relative z-10 ${viewMode === 'grid' ? 'text-white' : theme === 'dark' ? 'text-white' : 'text-black'}`}
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            {files.length === 0 ? (
                <p>No files found.</p>
            ) : (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-4 justify-start`}>
                    {filteredFiles.map(file => (
                        <Card
                            key={file.id}
                            className={`p-5 border border-gray-300 ${
                                theme === 'dark' ? 'hover:bg-accent' : 'hover:bg-gray-200'
                            }`}
                        >
                            <h3 className="text-sm font-semibold">{file.name}</h3>
                            <p className="text-xs text-gray-400">{file.type}</p>
                            <div className="flex justify-end mt-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFileDelete(file.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}