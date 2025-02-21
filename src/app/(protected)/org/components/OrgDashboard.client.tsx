'use client';

import { useParams, useRouter } from 'next/navigation';

import DashboardView, { Column } from '@/components/base/DashboardView';
import { useUserProjects } from '@/hooks/queries/useProject';
import { useUser } from '@/lib/providers/user.provider';
import { useContextStore } from '@/lib/store/context.store';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';

export default function OrgDashboard() {
    // Navigation hooks
    const router = useRouter();
    const params = useParams<{ orgId: string }>();

    // User context hooks
    const { profile } = useUser();
    const { setCurrentProjectId } = useContextStore();
    const { data, isLoading: projectsLoading } = useUserProjects(
        profile?.id || '',
        profile?.current_organization_id || '',
    );

    const columns: Column<Project>[] = [
        {
            header: 'Name',
            accessor: (item: Project) => item.name,
        },
        {
            header: 'Status',
            accessor: (item: Project) => item.status || 'N/A',
        },
    ];

    const handleRowClick = (item: Project) => {
        setCurrentProjectId(item.id);
        router.push(`/org/${params?.orgId}/${item.id}`);
    };

    const handleExternalDocsClick = () => {
        router.push(`/org/${params?.orgId}/externalDocs`);
    };

    return (
        <div className="container p-6">
            <h1 className="text-xl font-medium">Projects</h1>
            <DashboardView
                data={data || []}
                columns={columns}
                isLoading={projectsLoading}
                emptyMessage="No projects found."
                onRowClick={handleRowClick}
            />
            <div className="project-documents mt-8">
                <h2 className="text-xl font-medium mb-4">Document Collection</h2>
                <div className="recent-documents mb-4">
                    {/* Placeholder for recently added documents */}
                    <p>No recent documents available.</p>
                </div>
                <Button variant="secondary"
                    onClick={handleExternalDocsClick}
                >
                    Go to External Docs
                </Button>
            </div>
        </div>
    );
}