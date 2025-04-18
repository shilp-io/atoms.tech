'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

import TraceabilityMatrixView from '@/components/custom/TestBed/TestMatrix';
import TestCaseView from '@/components/custom/TestBed/TestTable';
import { useCreateTestReq } from '@/components/custom/TestBed/useTestReq';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Database } from '@/types/base/database.types';

export default function TestBed() {
    const [viewMode, setViewMode] = useState<
        'Test Cases' | 'Traceability Matrix'
    >('Test Cases');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTestData, setNewTestData] = useState({
        title: '',
        description: '',
        test_type: 'unit' as Database['public']['Enums']['test_type'],
        method: 'manual' as Database['public']['Enums']['test_method'],
        priority: 'medium' as Database['public']['Enums']['test_priority'],
        status: 'draft' as Database['public']['Enums']['test_status'],
    });
    const { projectId } = useParams();
    const { toast } = useToast();
    const createTestReq = useCreateTestReq();

    const handleCreateTest = async () => {
        if (!newTestData.title) {
            toast({
                title: 'Error',
                description: 'Title is required',
                variant: 'destructive',
            });
            return;
        }

        try {
            await createTestReq.mutateAsync({
                ...newTestData,
                project_id: projectId as string,
                is_active: true,
            });

            toast({
                title: 'Success',
                description: 'Test case created successfully',
                variant: 'default',
            });

            setShowAddModal(false);
            setNewTestData({
                title: '',
                description: '',
                test_type: 'unit',
                method: 'manual',
                priority: 'medium',
                status: 'draft',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to create test case',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <h1 className="text-4xl font-medium mb-6">Verification Tracing</h1>

            <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start">
                <Button
                    variant="outline"
                    onClick={() => setShowAddModal(true)}
                    className="bg-white"
                >
                    <span className="mr-2">+</span> Add Test Case
                </Button>

                <div className="relative">
                    <label className="text-sm text-gray-500 absolute -top-5">
                        View Mode
                    </label>
                    <select
                        className="bg-white shadow rounded-md px-4 py-2 pr-8 appearance-none w-full sm:w-auto"
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value as any)}
                    >
                        <option>Test Cases</option>
                        <option>Traceability Matrix</option>
                    </select>
                </div>
            </div>

            {viewMode === 'Test Cases' ? (
                <TestCaseView projectId={projectId as string} />
            ) : (
                <TraceabilityMatrixView projectId={projectId as string} />
            )}

            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Test Case</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={newTestData.title}
                                onChange={(e) =>
                                    setNewTestData({
                                        ...newTestData,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="Test case title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Description
                            </label>
                            <textarea
                                className="w-full p-2 border rounded"
                                rows={3}
                                value={newTestData.description}
                                onChange={(e) =>
                                    setNewTestData({
                                        ...newTestData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Test case description"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Type
                                </label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={newTestData.test_type}
                                    onChange={(e) =>
                                        setNewTestData({
                                            ...newTestData,
                                            test_type: e.target
                                                .value as Database['public']['Enums']['test_type'],
                                        })
                                    }
                                >
                                    <option value="unit">Unit</option>
                                    <option value="integration">
                                        Integration
                                    </option>
                                    <option value="system">System</option>
                                    <option value="acceptance">
                                        Acceptance
                                    </option>
                                    <option value="performance">
                                        Performance
                                    </option>
                                    <option value="security">Security</option>
                                    <option value="usability">Usability</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Priority
                                </label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={newTestData.priority}
                                    onChange={(e) =>
                                        setNewTestData({
                                            ...newTestData,
                                            priority: e.target
                                                .value as Database['public']['Enums']['test_priority'],
                                        })
                                    }
                                >
                                    <option value="critical">Critical</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowAddModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateTest}
                            disabled={
                                !newTestData.title || createTestReq.isPending
                            }
                        >
                            {createTestReq.isPending
                                ? 'Creating...'
                                : 'Create Test Case'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
