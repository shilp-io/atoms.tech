'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/supabaseBrowser';
import { useUser } from '@/lib/providers/user.provider';

// Define the interface for the diagram item based on the actual database schema
interface DiagramItem {
    id: string;
    name?: string;
    thumbnail_url?: string;
    updated_at: string;
    created_by: string;
}

interface DiagramGalleryProps {
    onNewDiagram: () => void;
    onSelectDiagram: (diagramId: string) => void;
}

const DiagramGallery: React.FC<DiagramGalleryProps> = ({
    onNewDiagram,
    onSelectDiagram,
}) => {
    const [diagrams, setDiagrams] = useState<DiagramItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDiagramId, setSelectedDiagramId] = useState<string | null>(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user } = useUser();
    const pathname = usePathname();
    const router = useRouter();
    const organizationId = pathname.split('/')[2];
    const projectId = pathname.split('/')[4];

    // Fetch all diagrams for the current project
    const fetchDiagrams = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (!projectId) return;

            const { data, error } = await supabase
                .from('excalidraw_diagrams')
                .select('id, name, thumbnail_url, updated_at, created_by')
                .eq('project_id', projectId)
                .order('updated_at', { ascending: false });

            if (error) {
                console.error('Error fetching diagrams:', error);
                setError('Failed to load diagrams. Please try again.');
                return;
            }

            // Map data to DiagramItem interface with optional fields
            const mappedData: DiagramItem[] = data.map((item: any) => ({
                id: item.id,
                name: item.name || 'Untitled Diagram',
                thumbnail_url: item.thumbnail_url || null,
                updated_at: item.updated_at,
                created_by: item.created_by,
            }));

            setDiagrams(mappedData);
        } catch (err) {
            console.error('Error in fetchDiagrams:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch diagrams when component mounts or projectId changes
    useEffect(() => {
        if (projectId) {
            fetchDiagrams();
        }
    }, [projectId]);

    const handleSelectDiagram = (diagramId: string) => {
        setSelectedDiagramId(diagramId);
        onSelectDiagram(diagramId);

        // Update URL with selected diagram ID
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('id', diagramId);
        window.history.pushState({}, '', newUrl);
    };

    const handleRenameDiagram = async (diagramId: string) => {
        if (!newName.trim()) return;

        try {
            const { error } = await supabase
                .from('excalidraw_diagrams')
                .update({ name: newName.trim() })
                .eq('id', diagramId);

            if (error) {
                console.error('Error renaming diagram:', error);
                setError('Failed to rename diagram');
                return;
            }

            // Update local state
            setDiagrams((prev) =>
                prev.map((d) =>
                    d.id === diagramId ? { ...d, name: newName.trim() } : d
                )
            );
            setIsRenaming(false);
            setNewName('');
        } catch (err) {
            console.error('Error in handleRenameDiagram:', err);
            setError('An unexpected error occurred');
        }
    };

    const handleDeleteDiagram = async (diagramId: string) => {
        try {
            const { error } = await supabase
                .from('excalidraw_diagrams')
                .delete()
                .eq('id', diagramId);

            if (error) {
                console.error('Error deleting diagram:', error);
                setError('Failed to delete diagram');
                return;
            }

            // Remove from local state
            setDiagrams((prev) => prev.filter((d) => d.id !== diagramId));
            setIsDeleting(false);

            // If the deleted diagram was selected, clear selection
            if (selectedDiagramId === diagramId) {
                setSelectedDiagramId(null);
            }
        } catch (err) {
            console.error('Error in handleDeleteDiagram:', err);
            setError('An unexpected error occurred');
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            return 'Unknown date';
        }
    };

    return (
        <div className="p-5 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-bold">Diagram Gallery</h2>
                <Button 
                    onClick={onNewDiagram}
                    className="flex items-center gap-1"
                >
                    <Plus size={16} />
                    New Diagram
                </Button>
            </div>

            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded-md mb-5">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            ) : diagrams.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No diagrams found</p>
                    <Button onClick={onNewDiagram}>Create Your First Diagram</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {diagrams.map((diagram) => (
                        <div
                            key={diagram.id}
                            className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden border ${
                                selectedDiagramId === diagram.id
                                    ? 'border-indigo-500 ring-2 ring-indigo-300'
                                    : 'border-gray-200 dark:border-gray-700'
                            } shadow-sm hover:shadow-md transition-all cursor-pointer`}
                        >
                            <div 
                                className="h-40 bg-gray-100 dark:bg-gray-900 flex items-center justify-center"
                                onClick={() => handleSelectDiagram(diagram.id)}
                            >
                                {diagram.thumbnail_url ? (
                                    <img
                                        src={diagram.thumbnail_url}
                                        alt={diagram.name || 'Untitled Diagram'}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="text-center p-4">
                                        <p className="text-gray-400 truncate">{diagram.name || 'Untitled Diagram'}</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium truncate" title={diagram.name || 'Untitled Diagram'}>
                                        {diagram.name || 'Untitled Diagram'}
                                    </h3>
                                    <div className="flex gap-1">
                                        <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
                                            <DialogTrigger asChild>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsRenaming(true);
                                                        setNewName(diagram.name || 'Untitled Diagram');
                                                    }}
                                                    className="p-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Rename Diagram</DialogTitle>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <Input
                                                        value={newName}
                                                        onChange={(e) => setNewName(e.target.value)}
                                                        placeholder="Diagram name"
                                                        className="mb-4"
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setIsRenaming(false)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleRenameDiagram(diagram.id)}
                                                        >
                                                            Save
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                                            <DialogTrigger asChild>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsDeleting(true);
                                                    }}
                                                    className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Delete Diagram</DialogTitle>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <p>Are you sure you want to delete "{diagram.name || 'Untitled Diagram'}"?</p>
                                                    <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
                                                    <div className="flex justify-end gap-2 mt-4">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setIsDeleting(false)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => handleDeleteDiagram(diagram.id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Last updated: {formatDate(diagram.updated_at)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DiagramGallery; 