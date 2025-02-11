'use server';

import { UserProvider } from '@/lib/providers/user.provider';
import { OrganizationProvider } from '@/lib/providers/organization.provider';
import { getAuthUserServer, getUserProfileServer } from '@/lib/db/server';

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getAuthUserServer();
    const profile = await getUserProfileServer(user.user.id);

    return (
        <UserProvider initialUser={user.user} initialProfile={profile}>
            <OrganizationProvider>
                {children}
            </OrganizationProvider>
        </UserProvider>
    );
}
