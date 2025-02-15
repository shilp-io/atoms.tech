<<<<<<< HEAD
'use server';

import { getAuthUserServer, getUserProfileServer } from '@/lib/db/server';
import { OrganizationProvider } from '@/lib/providers/organization.provider';
import { UserProvider } from '@/lib/providers/user.provider';
=======
import Sidebar from '@/components/base/Sidebar';
import VerticalToolbar from '@/components/custom/VerticalToolbar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getAuthUser, getUserProfile } from '@/lib/db';
import { OrganizationProvider } from '@/lib/providers/organization.provider';
import { UserProvider } from '@/lib/providers/user.provider';
import React from 'react';
>>>>>>> origin/main

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getAuthUserServer();
    const profile = await getUserProfileServer(user.user.id);

    return (
        <OrganizationProvider>
            <UserProvider initialUser={user.user} initialProfile={profile}>
<<<<<<< HEAD
                {children}
=======
                <SidebarProvider>
                    <Sidebar />
                    <div className="relative flex-1 p-16">
                        {children}
                        <VerticalToolbar />
                    </div>
                </SidebarProvider>
>>>>>>> origin/main
            </UserProvider>
        </OrganizationProvider>
    );
}
