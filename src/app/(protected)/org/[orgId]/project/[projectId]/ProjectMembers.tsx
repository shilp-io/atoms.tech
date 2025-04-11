'use client';

import { useQuery } from '@tanstack/react-query';
import { MoreHorizontal, Users } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/supabaseBrowser';
import { getProjectMembers } from '@/lib/db/client/projects.client';
import { EUserRoleType } from '@/types';
import { useUser } from '@/lib/providers/user.provider';

interface ProjectMembersProps {
    projectId: string;
}

export default function ProjectMembers({ projectId }: ProjectMembersProps) {
    const { toast } = useToast();
    const { user } = useUser();
    const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<EUserRoleType | null>(null);
    const [isRolePromptOpen, setIsRolePromptOpen] = useState(false);

    const { data: members = [], isLoading, refetch } = useQuery({
        queryKey: ['project-members', projectId],
        queryFn: () => getProjectMembers(projectId),
    });

    const isOwner = members.some(
        (member) => member.id === user?.id && member.role === 'owner',
    );

    const sortedMembers = [...members].sort((a, b) => {
        if (a.role === 'owner') return -1;
        if (b.role === 'owner') return 1;
        return 0;
    });

    const handleRemoveMember = async (memberId: string) => {
        try {
            const { error } = await supabase
                .from('project_members')
                .delete()
                .eq('project_id', projectId)
                .eq('user_id', memberId);

            if (error) {
                console.error('Error removing member:', error);
                throw error;
            }

            alert('Member removed successfully!');

            refetch();
        } catch (error) {
            alert('Failed to remove member.');
        }
    };

    const handleChangeRole = async () => {
        if (!activeMemberId || !selectedRole) {
            toast({
                title: 'Error',
                description: 'Invalid operation. Please select a role.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const { error } = await supabase
                .from('project_members')
                .update({ role: selectedRole })
                .eq('project_id', projectId)
                .eq('id', activeMemberId);

            if (error) {
                console.error('Error updating project member role:', error);
                throw error;
            }

            toast({
                title: 'Success',
                description: `Role updated to ${selectedRole} successfully!`,
                variant: 'default',
            });

            refetch();
            setIsRolePromptOpen(false);
            setActiveMemberId(null);
            setSelectedRole(null);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to change role. Please try again.',
                variant: 'destructive',
            });
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-xl">Members</CardTitle>
                    <CardDescription>
                        Manage project members
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between animate-pulse"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                                    <div className="space-y-1">
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                                    </div>
                                </div>
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                ) : sortedMembers.length > 0 ? (
                    <div className="space-y-3">
                        {sortedMembers.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Users className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-medium">
                                            {member.full_name || 'User'}
                                            {member.id === user?.id && ' (you)'}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {member.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            member.role === 'owner'
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                                : member.role === 'admin'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                        }`}
                                    >
                                        {member.role}
                                    </span>
                                    {isOwner && member.role !== 'owner' && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setActiveMemberId(member.id);
                                                        setIsRolePromptOpen(true);
                                                    }}
                                                >
                                                    Change role
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        handleRemoveMember(member.id);
                                                    }}
                                                    className="text-red-600"
                                                >
                                                    Remove
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <Users className="h-8 w-8 mx-auto text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-medium">
                            No members found
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Invite members to collaborate
                        </p>
                    </div>
                )}
            </CardContent>

            {isRolePromptOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white dark:bg-gray-800 shadow-lg p-6 w-96 border border-gray-300 dark:border-gray-700 rounded-lg">
                        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                            Change Role
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                                    Select Role
                                </label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            {selectedRole
                                                ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)
                                                : 'Choose a role'}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {['member', 'admin'].map((role) => (
                                            <DropdownMenuItem
                                                key={role}
                                                onClick={() => setSelectedRole(role as EUserRoleType)}
                                            >
                                                {role.charAt(0).toUpperCase() + role.slice(1)}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4 space-x-2">
                            <Button
                                variant="outline"
                                className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                                onClick={() => {
                                    setIsRolePromptOpen(false);
                                    setSelectedRole(null);
                                    setActiveMemberId(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/80"
                                onClick={handleChangeRole}
                                disabled={!selectedRole}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
