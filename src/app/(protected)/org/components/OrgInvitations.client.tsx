'use client';

import { useState, useEffect } from 'react';
import { useCreateOrgInvitation } from '@/hooks/mutations/useOrgInvitationMutations';
import { useOrgInvitationsByOrgId } from '@/hooks/queries/useOrganization';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // Import Badge
import { X } from 'lucide-react'; // Import X icon
import { useUser } from '@/lib/providers/user.provider';
import { InvitationStatus } from '@/types/base/enums.types';
import { supabase } from '@/lib/supabase/supabaseBrowser';
import { useToast } from '@/components/ui/use-toast';

interface OrgInvitationsProps {
    orgId: string;
}

export default function OrgInvitations({ orgId }: OrgInvitationsProps) {
    const [inviteEmail, setInviteEmail] = useState('');
    const { user } = useUser();
    const { mutateAsync: createInvitation, isPending } = useCreateOrgInvitation();
    const { data: allInvitations, isLoading: outgoingLoading, refetch } = useOrgInvitationsByOrgId(orgId);
    const { toast } = useToast(); // Initialize toast

    // Filter invitations to only include pending ones
    const outgoingInvitations = allInvitations?.filter(
        (invitation) => invitation.status === InvitationStatus.pending
    );

    const handleInvite = async () => {
        if (!inviteEmail) {
            toast({ title: 'Error', description: 'Please enter a valid email.', variant: 'destructive' });
            return;
        }
        if (!user?.id) {
            toast({ title: 'Error', description: 'User not authenticated.', variant: 'destructive' });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inviteEmail.trim())) {
            toast({ title: 'Error', description: 'Please enter a valid email address.', variant: 'destructive' });
            return;
        }

        if (inviteEmail.trim() === user.email) {
            toast({ title: 'Error', description: 'You cannot send an invitation to yourself.', variant: 'destructive' });
            return;
        }

        try {
            // Check if the email exists in the profiles
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', inviteEmail.trim())
                .single();

            if (profileError || !profile) {
                toast({ title: 'Error', description: 'No user found with this email.', variant: 'destructive' });
                return;
            }

            // Check for duplicate invitations
            const { data: duplicateInvitations, error: duplicateError } = await supabase
                .from('organization_invitations')
                .select('*')
                .eq('email', inviteEmail.trim())
                .eq('organization_id', orgId)
                .eq('status', InvitationStatus.pending);

            if (duplicateError) {
                console.error('Error checking for duplicate invitations:', duplicateError);
                throw duplicateError;
            }

            if (duplicateInvitations && duplicateInvitations.length > 0) {
                toast({ title: 'Error', description: 'An invitation has already been sent to this email for this organization.', variant: 'destructive' });
                return;
            }

            // Create the invitation
            await createInvitation(
                {
                    email: inviteEmail.trim(),
                    role: 'member',
                    status: InvitationStatus.pending,
                    created_by: user.id,
                    organization_id: orgId,
                    updated_by: user.id,
                },
                {
                    onSuccess: () => {
                        toast({ title: 'Success', description: 'Invitation sent successfully!', variant: 'default' });
                        setInviteEmail('');
                        refetch(); // Refresh outgoing invitations
                    },
                    onError: (error) => {
                        console.error('Error sending invitation:', error);
                        toast({ title: 'Error', description: 'Failed to send invitation.', variant: 'destructive' });
                    },
                }
            );
        } catch (error) {
            console.error('Error handling invitation:', error);
            toast({ title: 'Error', description: 'Failed to process the invitation.', variant: 'destructive' });
        }
    };

    const handleRevoke = async (invitationId: string) => {
        if (!user?.id) {
            toast({ title: 'Error', description: 'User not authenticated.', variant: 'destructive' });
            return;
        }

        try {
            const { error } = await supabase
                .from('organization_invitations')
                .update({
                    status: InvitationStatus.revoked,
                    updated_by: user.id,
                })
                .eq('id', invitationId);

            if (error) {
                console.error('Error revoking invitation:', error);
                throw error;
            }

            toast({ title: 'Success', description: 'Invitation revoked successfully!', variant: 'default' });
            refetch(); // Refresh the list of outgoing invitations
        } catch (error) {
            console.error('Error revoking invitation:', error);
            toast({ title: 'Error', description: 'Failed to revoke invitation.', variant: 'destructive' });
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Invite Users Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Invite Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-4">
                        <Input
                            type="email"
                            placeholder="Enter user email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                        />
                        <Button onClick={handleInvite} disabled={isPending}>
                            Invite
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Outgoing Invitations Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Outgoing Invitations</CardTitle>
                </CardHeader>
                <CardContent>
                    {outgoingLoading ? (
                        <p>Loading outgoing invitations...</p>
                    ) : outgoingInvitations?.length ? (
                        <ul className="space-y-2">
                            {outgoingInvitations
                                .map((invitation) => (
                                    <li
                                        key={invitation.id}
                                        className="flex justify-between items-center rounded-md p-3" // Added outline styles
                                    >
                                        <div className="flex items-center space-x-2">
                                            <span>{invitation.email}</span>
                                            <Badge
                                                variant="outline"
                                                className="border-gray-300 text-gray-500" // Light gray color
                                            >
                                                {invitation.status}
                                            </Badge>
                                        </div>
                                        {invitation.status === InvitationStatus.pending && (
                                            <X
                                                className="h-5 w-5 text-accent cursor-pointer" // Use accent color
                                                onClick={() => handleRevoke(invitation.id)}
                                            />
                                        )}
                                    </li>
                                ))}
                        </ul>
                    ) : (
                        <p className="text-primary font-small ml-2">No outgoing invitations</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
