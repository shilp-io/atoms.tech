'use client';

import { useState, useEffect } from 'react';
import { useOrgInvitation, useUserSentOrgInvitations } from '@/hooks/queries/useOrganization';
import { useCreateOrgInvitation } from '@/hooks/mutations/useOrgInvitationMutations';
import { useCreateOrgMember } from '@/hooks/mutations/useOrgMemberMutation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/lib/providers/user.provider';
import { InvitationStatus } from '@/types/base/enums.types';
import { supabase } from '@/lib/supabase/supabaseBrowser';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/queryKeys';
interface OrgInvitationsProps {
    orgId: string;
}

export default function OrgInvitations({ orgId }: OrgInvitationsProps) {
    const [inviteEmail, setInviteEmail] = useState(''); // Email being typed into the text box
    const { user } = useUser(); // Current logged-in user
    const { data: invitations, isLoading: invitationsLoading, refetch } = useOrgInvitation(user?.email || ''); // Always use the current user's email for pending invitations
    const { mutateAsync: createInvitation, isPending } = useCreateOrgInvitation();
    const { mutateAsync: createOrgMember } = useCreateOrgMember();
    const [organizations, setOrganizations] = useState<Record<string, { id: string; name: string }>>({});
    const [orgLoading, setOrgLoading] = useState(false);
    const { data: sentInvitations, isLoading: sentInvitationsLoading } = useUserSentOrgInvitations(user?.id || '');
    const queryClient = useQueryClient();

    // Fetch organization data for all invitations
    useEffect(() => {
        const fetchOrganizations = async () => {
            if (!invitations || invitations.length === 0) return;

            setOrgLoading(true);
            const organizationIds = invitations.map((invitation) => invitation.organization_id);
            const { data, error } = await supabase
                .from('organizations')
                .select('id, name')
                .in('id', organizationIds);

            if (error) {
                console.error('Error fetching organizations:', error);
            } else {
                const orgMap = data.reduce((acc: Record<string, { id: string; name: string }>, org: { id: string; name: string }) => {
                    acc[org.id] = org;
                    return acc;
                }, {});
                setOrganizations(orgMap);
            }
            setOrgLoading(false);
        };

        fetchOrganizations();
    }, [invitations]);

    const handleInvite = () => {
        if (!inviteEmail) return alert('Please enter a valid email.');
        if (!user?.id) return alert('User not authenticated.');

        // Prevent inviting yourself
        if (inviteEmail === user.email) {
            return alert('You cannot send an invitation to yourself.');
        }

        // Check for duplicate invitations in sent invitations
        const duplicateInvitation = sentInvitations?.find(
            (invitation) =>
                invitation.organization_id === orgId &&
                invitation.email === inviteEmail &&
                invitation.status === InvitationStatus.pending
        );

        if (duplicateInvitation) {
            return alert('An invitation has already been sent to this email for this organization.');
        }

        createInvitation(
            {
                email: inviteEmail, // Use the email being typed into the text box
                role: 'member',
                status: InvitationStatus.pending, // Use the enum type
                created_by: user.id, // Use the current user's ID
                organization_id: orgId,
                updated_by: user.id, // Use the current user's ID
            },
            {
                onSuccess: async () => {
                    alert('Invitation sent successfully!');
                    setInviteEmail(''); // Clear the input field
                    await refetch(); // Refresh the invitation list immediately
                    //queryClient.invalidateQueries(queryKeys.organizationInvitations.byCreator(user.id)); // Refresh sentInvitations
                },
                onError: (error) => {
                    console.error('Error sending invitation:', error);
                    alert('Failed to send invitation.');
                },
            }
        );
    };

    const handleAccept = async (invitation: any) => {
        if (!user?.id) return alert('User not authenticated.');

        try {
            // Add the user to the organization_members table
            await createOrgMember({
                organization_id: invitation.organization_id,
                user_id: user.id,
                role: invitation.role,
                status: 'active',
                last_active_at: new Date().toISOString(),
            });

            // Update the invitation status to accepted
            await createInvitation({
                ...invitation,
                status: InvitationStatus.accepted,
                updated_by: user.id,
            });

            alert('Invitation accepted successfully!');
            refetch(); // Refresh the invitation list
        } catch (error) {
            console.error('Error accepting invitation:', error);
            alert('Failed to accept invitation.');
        }
    };

    const handleReject = async (invitation: any) => {
        if (!user?.id) return alert('User not authenticated.');

        try {
            // Update the invitation status to rejected directly in Supabase
            const { error } = await supabase
                .from('organization_invitations')
                .update({
                    status: InvitationStatus.rejected,
                    updated_by: user.id,
                })
                .eq('id', invitation.id);

            if (error) {
                console.error('Error rejecting invitation:', error);
                throw error;
            }

            alert('Invitation rejected successfully!');
            refetch(); // Refresh the invitation list to remove the rejected invitation
        } catch (error) {
            console.error('Error rejecting invitation:', error);
            alert('Failed to reject invitation.');
        }
    };

    return (
        <div className="space-y-6">
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

            {/* Pending Invitations Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Pending Invitations</CardTitle>
                </CardHeader>
                <CardContent>
                    {invitationsLoading || orgLoading ? (
                        <p>Loading invitations...</p>
                    ) : invitations?.length ? (
                        <ul className="space-y-2">
                            {invitations.map((invitation) => {
                                const organization = organizations[invitation.organization_id];

                                return (
                                    <li key={invitation.id} className="flex justify-between items-center">
                                        <span>
                                            Invitation from{' '}
                                            <strong>{organization?.name || 'Unknown Organization'}</strong>
                                        </span>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => handleAccept(invitation)}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleReject(invitation)}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p>No pending invitations.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
