import DashboardView, { Column } from '@/components/base/DashboardView';
import { useUser } from '@/lib/providers/user.provider';
<<<<<<< HEAD:src/app/(protected)/[orgSlug]/components/OrgDashboard.client.tsx
import { getUserProjects } from '@/lib/db/client';
import { useUserProjects } from '@/hooks/queries/useProject';
=======
import { useContextStore } from '@/lib/store/context.store';
import { supabase } from '@/lib/supabase/supabaseBrowser';
import { Project } from '@/types';
import { ProjectSchema } from '@/types/validation/projects.validation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
>>>>>>> 68a9679 (Restructure URLs, refactor layouts and sidebars):src/app/(protected)/org/components/OrgDashboard.client.tsx

export default function OrgDashboard() {
    // Navigation hooks
    const router = useRouter();

    // User context hooks
    const { profile } = useUser();
    const { setCurrentProjectId } = useContextStore();
    const { data, isLoading: projectsLoading } = useUserProjects(profile?.id || '', profile?.current_organization_id || '');

    const columns: Column<Project>[] = [
        {
            header: 'Name',
            accessor: (item: Project) => (item as Project).name,
        },
        {
            header: 'Status',
            accessor: (item: Project) => (item as Project).status || 'N/A',
        },
    ];

    const handleRowClick = (item: Project) => {
        setCurrentProjectId(item.id);
        router.push(`/project/${item.slug}`);
    };

    return (
        <DashboardView
            data={data || []}
            columns={columns}
            isLoading={projectsLoading}
            emptyMessage="No projects found."
            onRowClick={handleRowClick}
        />
    );
}
