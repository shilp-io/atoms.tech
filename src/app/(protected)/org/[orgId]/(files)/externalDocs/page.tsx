'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Upload, Trash, List, Grid } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useDeleteExternalDocument, useUploadExternalDocument } from '@/hooks/mutations/useExternalDocumentsMutations';
import { useExternalDocumentsByOrg } from '@/hooks/queries/useExternalDocuments';
import { motion } from 'framer-motion';
import { useOrganization } from '@/lib/providers/organization.provider';

export default function ExternalDocsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { theme } = useTheme();
    const uploadDocument = useUploadExternalDocument();
    const deleteDocument = useDeleteExternalDocument();
    const { organization } = useOrganization();
    const pathname = usePathname();
    
    // Extract orgId from URL path
    const pathOrgId = pathname ? pathname.split('/')[2] : null;
    
    // Use organization.id if available, otherwise fall back to path-based orgId
    const currentOrgId = organization?.id || pathOrgId;
    
    // Only fetch documents if we have a valid orgId
    const { data, refetch } = useExternalDocumentsByOrg(
        currentOrgId ? currentOrgId : ''
    );
    
    console.log(currentOrgId);
    
    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }
        
        if (!currentOrgId) {
            alert('Organization ID is missing. Please try again or contact support.');
            console.error('Missing organization ID for file upload');
            return;
        }
        
        try {
            setIsUploading(true);
            await uploadDocument.mutateAsync({ file, orgId: currentOrgId });
            refetch(); // Refresh the file list after upload
            alert('File uploaded successfully!');
            // Clear the file input
            e.target.value = '';
        } catch (error) {
            console.error('Failed to upload document', error);
            alert('Failed to upload document.');
        } finally {
            setIsUploading(false);
        }
    };

    // Handle file deletion
    const handleFileDelete = async (documentId: string) => {
        if (!currentOrgId) {
            alert('Organization ID is missing. Please try again or contact support.');
            return;
        }
        
        try {
            setIsDeleting(true);
            await deleteDocument.mutateAsync({ documentId, orgId: currentOrgId });
            refetch(); // Refresh the file list after deletion
            alert('File deleted successfully!');
        } catch (error) {
            console.error('Failed to delete document', error);
            alert('Failed to delete document.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter files based on search term
    const filteredFiles = data?.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openFile = (documentId: string) => {
        if (!currentOrgId) {
            alert('Organization ID is missing. Cannot open file.');
            return;
        }
        
        const filePath = `${currentOrgId}/${documentId}`;
        // Open the file in a new tab
        window.open(`/api/external-documents/${filePath}`, '_blank');
    };

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
                        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                    />
                    <label htmlFor="file-upload">
                        <Button 
                            variant="default" 
                            className="w-9 h-9" 
                            onClick={() => document.getElementById('file-upload')?.click()}
                            disabled={!currentOrgId || isUploading}
                        >
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
            
            {!currentOrgId ? (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">Organization not found. Please select a valid organization.</p>
                </div>
            ) : isUploading ? (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">Uploading document...</p>
                </div>
            ) : !data ? (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">Loading documents...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No documents found. Upload a document to get started.</p>
                </div>
            ) : (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-4 justify-start`}>
                    {filteredFiles?.map(file => (
                        <Card
                            key={file.id}
                            className={`p-5 border border-gray-300 ${
                                theme === 'dark' ? 'hover:bg-accent' : 'hover:bg-gray-200'
                            } cursor-pointer`}
                            onClick={() => openFile(file.id)}
                        >
                            <h3 className="text-sm font-semibold">{file.name}</h3>
                            <p className="text-xs text-gray-400">{file.type}</p>
                            <div className="flex justify-end mt-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click from triggering
                                        handleFileDelete(file.id);
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                    disabled={isDeleting}
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