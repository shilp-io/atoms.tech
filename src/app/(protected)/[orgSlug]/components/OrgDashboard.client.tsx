'use client';

import DashboardView, {
    Column,
    SupportedDataTypes,
} from '@/components/base/DashboardView';
import { Project } from '@/types';
import { useRouter, useParams } from 'next/navigation';
import { useContextStore } from '@/lib/store/context.store';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/supabaseBrowser';
import { ProjectSchema } from '@/types/validation/projects.validation';
import { useUser } from '@/lib/providers/user.provider';
import { getUserProjects } from '@/lib/db/client';
import { useUserProjects } from '@/hooks/queries/useProject';

export default function OrgDashboard() {
    // Navigation hooks
    const router = useRouter();
    const params = useParams<{ orgSlug: string }>();

    // User context hooks
    const { profile } = useUser();
    const { setCurrentProjectId } = useContextStore();
    const { data, isLoading: projectsLoading } = useUserProjects(profile?.id || '', profile?.current_organization_id || '');

    const columns: Column[] = [
        {
            header: 'Name',
            accessor: (item: SupportedDataTypes) => (item as Project).name,
        },
        {
            header: 'Status',
            accessor: (item: SupportedDataTypes) =>
                (item as Project).status || 'N/A',
        },
    ];

    const handleRowClick = (item: SupportedDataTypes) => {
        setCurrentProjectId((item as Project).id);
        router.push(`/${params.orgSlug}/${(item as Project).slug}`);
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
