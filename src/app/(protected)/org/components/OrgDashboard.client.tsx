<<<<<<< HEAD
'use client';

import DashboardView, {
    Column,
} from '@/components/base/DashboardView';
import { Project } from '@/types';
import { useRouter, useParams } from 'next/navigation';
import { useContextStore } from '@/lib/store/context.store';
import { useUser } from '@/lib/providers/user.provider';
import { useUserProjects } from '@/hooks/queries/useProject';
=======
import DashboardView, { Column } from '@/components/base/DashboardView';
import { useUser } from '@/lib/providers/user.provider';
import { useContextStore } from '@/lib/store/context.store';
import { supabase } from '@/lib/supabase/supabaseBrowser';
import { Project } from '@/types';
import { ProjectSchema } from '@/types/validation/projects.validation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
>>>>>>> origin/main

export default function OrgDashboard() {
    // Navigation hooks
    const router = useRouter();
<<<<<<< HEAD
    const params = useParams<{ orgId: string }>();
=======
>>>>>>> origin/main

    // User context hooks
    const { profile } = useUser();
    const { setCurrentProjectId } = useContextStore();
<<<<<<< HEAD
    const { data, isLoading: projectsLoading } = useUserProjects(profile?.id || '', profile?.current_organization_id || '');
=======

    // Local state
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch projects for current user in organization
    useEffect(() => {
        const projects = async () => {
            const { data: projectMemberData, error: memberError } =
                await supabase
                    .from('project_members')
                    .select('project_id')
                    .eq('user_id', profile?.id)
                    .eq('org_id', profile?.current_organization_id)
                    .eq('status', 'active');

            if (memberError) throw memberError;

            const projectIds = projectMemberData.map((pm) => pm.project_id);

            const { data: projectData, error } = await supabase
                .from('projects')
                .select('*')
                .eq('is_deleted', false)
                .in('id', projectIds);

            if (error) throw error;

            const parsedProjects = projectData.map((project) =>
                ProjectSchema.parse(project),
            );
            setProjects(parsedProjects);
            setIsLoading(false);
        };
        projects();
    }, [profile?.current_organization_id, profile?.id]);
>>>>>>> origin/main

    const columns: Column<Project>[] = [
        {
            header: 'Name',
<<<<<<< HEAD
            accessor: (item: Project) => item.name,
        },
        {
            header: 'Status',
            accessor: (item: Project) => item.status || 'N/A',
=======
            accessor: (item: Project) => (item as Project).name,
        },
        {
            header: 'Status',
            accessor: (item: Project) => (item as Project).status || 'N/A',
>>>>>>> origin/main
        },
    ];

    const handleRowClick = (item: Project) => {
        setCurrentProjectId(item.id);
<<<<<<< HEAD
        router.push(`/org/${params.orgId}/${item.id}`);
=======
        router.push(`/project/${item.slug}`);
>>>>>>> origin/main
    };

    return (
        <DashboardView
<<<<<<< HEAD
            data={data || []}
            columns={columns}
            isLoading={projectsLoading}
=======
            data={projects || []}
            columns={columns}
            isLoading={isLoading}
>>>>>>> origin/main
            emptyMessage="No projects found."
            onRowClick={handleRowClick}
        />
    );
}
