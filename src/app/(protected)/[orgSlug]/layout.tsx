// [orgSlug]/layout.tsx
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from './components/DashboardSidebar.client';
import VerticalToolbar from '@/components/custom/VerticalToolbar';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/queryKeys';
import { getUserProjectsServer, getAuthUserServer, getOrganizationIdBySlugServer } from '@/lib/db/server';
import { notFound } from 'next/navigation';

interface OrgLayoutProps {
    children: React.ReactNode;
    params: Promise<{ orgSlug: string }>;
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
    const { orgSlug } = await params;

    if (!orgSlug) {
        notFound();
    }

    const queryClient = new QueryClient();
    const user = await getAuthUserServer();

    let orgId: string;
    try {
        orgId = await getOrganizationIdBySlugServer(orgSlug);
        if (!orgId) {
            notFound();
        }
    } catch (error) {
        console.error('Error fetching organization:', error);
        notFound();
    }

    try {
        await queryClient.prefetchQuery({
            queryKey: queryKeys.projects.byOrganization(orgId),
            queryFn: async () => {
                return await getUserProjectsServer(user?.user.id || '', orgId);
            },
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <SidebarProvider>
                <DashboardSidebar />
                <div className="relative flex-1 p-16">
                    {children}
                    <VerticalToolbar />
                </div>
            </SidebarProvider>
        </HydrationBoundary>
    );
}