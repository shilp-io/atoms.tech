'use client';

import * as React from 'react';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { motion, LayoutGroup } from 'framer-motion';
import { Filter, Plus, Check, X, Edit2, Trash2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { transitionConfig } from '@/lib/utils/animations';
import { cn } from '@/lib/utils';

export type EditableColumnType = 'text' | 'select' | 'number' | 'date';

export interface EditableColumn<T> {
    header: string;
    width?: number;
    accessor: keyof T;
    type: EditableColumnType;
    options?: string[]; // For select type columns
    required?: boolean;
    validation?: (value: any) => boolean;
    isSortable?: boolean;
}

interface MonospaceEditableTableProps<T extends Record<string, any>> {
    data: T[];
    columns: EditableColumn<T>[];
    onSave?: (item: T, isNew: boolean) => Promise<void>;
    onDelete?: (item: T) => Promise<void>;
    isLoading?: boolean;
    emptyMessage?: string;
    showFilter?: boolean;
    filterComponent?: React.ReactNode;
}

export function MonospaceEditableTable<T extends Record<string, any>>({
    data,
    columns,
    onSave,
    onDelete,
    isLoading = false,
    emptyMessage = 'No items found.',
    showFilter = true,
    filterComponent,
}: MonospaceEditableTableProps<T>) {
    const [sortKey, setSortKey] = React.useState<keyof T | null>(null);
    const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
    const [hoveredCell, setHoveredCell] = React.useState<{ row: number; col: number } | null>(null);
    const [isEditMode, setIsEditMode] = React.useState(false);
    const [editingData, setEditingData] = React.useState<Record<string, T>>({});
    const [isAddingNew, setIsAddingNew] = React.useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
    const [itemToDelete, setItemToDelete] = React.useState<T | null>(null);

    const sortedData = React.useMemo(() => {
        return [...data].sort((a, b) => {
            if (!sortKey) return 0;
            const aValue = a[sortKey];
            const bValue = b[sortKey];
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortKey, sortOrder]);

    const handleEditModeToggle = () => {
        if (isEditMode) {
            // Exit edit mode
            setIsEditMode(false);
            setEditingData({});
        } else {
            // Enter edit mode - initialize editing data for all rows
            const initialEditData = sortedData.reduce((acc, item) => {
                acc[item.id as string] = { ...item };
                return acc;
            }, {} as Record<string, T>);
            setEditingData(initialEditData);
            setIsEditMode(true);
        }
    };

    const handleRowSave = async (item: T) => {
        const editedItem = editingData[item.id as string];
        if (!editedItem) return;

        try {
            await onSave?.(editedItem, false);
            // Keep edit mode on but update the editing data with saved values
            setEditingData(prev => ({
                ...prev,
                [item.id as string]: editedItem
            }));
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };

    const handleDeleteClick = (item: T) => {
        setItemToDelete(item);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;

        try {
            await onDelete?.(itemToDelete);
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const handleCellChange = (itemId: string, accessor: keyof T, value: any) => {
        setEditingData(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [accessor]: value
            }
        }));
    };

    const handleMockRowClick = () => {
        const newItem = columns.reduce((acc, col) => {
            if (col.type === 'select' && col.options?.length) {
                acc[col.accessor] = col.options[0];
            } else {
                acc[col.accessor] = '';
            }
            return acc;
        }, {} as any);
        newItem.id = 'new';
        setEditingData(prev => ({
            ...prev,
            new: newItem
        }));
        setIsAddingNew(true);
    };

    const renderCell = (item: T, column: EditableColumn<T>, rowIndex: number, colIndex: number) => {
        const isEditing = isEditMode || item.id === 'new';
        const value = isEditing ? editingData[item.id as string]?.[column.accessor] : item[column.accessor];
        const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex;

        if (isEditing) {
            switch (column.type) {
                case 'select':
                    return (
                        <Select
                            value={value as string}
                            onValueChange={(value) => handleCellChange(item.id as string, column.accessor, value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {column.options?.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    );
                case 'number':
                    return (
                        <Input
                            type="number"
                            value={value as string}
                            onChange={(e) => handleCellChange(item.id as string, column.accessor, e.target.value)}
                            data-editing="true"
                        />
                    );
                case 'date':
                    return (
                        <Input
                            type="date"
                            value={value as string}
                            onChange={(e) => handleCellChange(item.id as string, column.accessor, e.target.value)}
                            data-editing="true"
                        />
                    );
                default:
                    return (
                        <Input
                            value={value as string}
                            onChange={(e) => handleCellChange(item.id as string, column.accessor, e.target.value)}
                            data-editing="true"
                        />
                    );
            }
        }

        return (
            <div
                className={cn(
                    'p-2 rounded transition-colors',
                    isHovered && 'bg-accent/50'
                )}
            >
                {value}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-muted rounded-lg" />
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-muted rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <LayoutGroup>
            <motion.div className="relative space-y-4" layout transition={transitionConfig}>
                <div className="flex justify-between items-center">
                    {showFilter && (
                        <div className="bg-background rounded-lg">
                            {filterComponent || (
                                <Button variant="outline" size="sm" className="inline-flex items-center">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                            )}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Button
                            onClick={handleEditModeToggle}
                            variant="outline"
                            size="sm"
                            className="inline-flex items-center"
                        >
                            <Edit2 className="h-4 w-4 mr-2" />
                            {isEditMode ? 'Exit Edit Mode' : 'Edit All'}
                        </Button>
                    </div>
                </div>

                <div className="relative overflow-hidden font-mono border rounded-lg">
                    {sortedData.length === 0 && !isAddingNew ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {emptyMessage}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map((column, index) => (
                                        <TableHead
                                            key={column.header}
                                            style={{
                                                width: column.width ? `${column.width}px` : undefined,
                                            }}
                                        >
                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    if (column.isSortable) {
                                                        if (sortKey === column.accessor) {
                                                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                                        } else {
                                                            setSortKey(column.accessor);
                                                            setSortOrder('asc');
                                                        }
                                                    }
                                                }}
                                                className={cn(
                                                    'h-8 text-left font-medium',
                                                    column.isSortable && 'hover:bg-accent hover:text-accent-foreground cursor-pointer'
                                                )}
                                                disabled={!column.isSortable}
                                            >
                                                {column.header}
                                                {column.isSortable && (
                                                    <CaretSortIcon className="ml-2 h-4 w-4" />
                                                )}
                                            </Button>
                                        </TableHead>
                                    ))}
                                    {isEditMode && <TableHead style={{ width: '100px' }}>Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedData.map((item, rowIndex) => (
                                    <TableRow
                                        key={item.id}
                                        className="font-mono"
                                    >
                                        {columns.map((column, colIndex) => (
                                            <TableCell
                                                key={`${String(item.id)}-${String(column.accessor)}`}
                                                onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                                                onMouseLeave={() => setHoveredCell(null)}
                                            >
                                                {renderCell(item, column, rowIndex, colIndex)}
                                            </TableCell>
                                        ))}
                                        {isEditMode && (
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleRowSave(item)}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteClick(item)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                                {/* Mock row for adding new items */}
                                {!isAddingNew && (
                                    <TableRow 
                                        className={cn(
                                            "font-mono cursor-pointer group/mock-row",
                                            "hover:bg-accent/5 transition-colors"
                                        )}
                                        onClick={handleMockRowClick}
                                    >
                                        {columns.map((column, colIndex) => (
                                            <TableCell
                                                key={`mock-${String(column.accessor)}`}
                                                className={cn(
                                                    "text-muted-foreground/50 group-hover/mock-row:text-muted-foreground",
                                                    colIndex === 0 && "font-medium"
                                                )}
                                            >
                                                {colIndex === 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <Plus className="h-4 w-4" />
                                                        New Row
                                                    </div>
                                                ) : (
                                                    "..."
                                                )}
                                            </TableCell>
                                        ))}
                                        {isEditMode && <TableCell />}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </motion.div>

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this requirement.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </LayoutGroup>
    );
} 