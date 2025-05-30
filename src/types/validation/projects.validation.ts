import { z } from 'zod';

import { Block, EProjectStatus, EVisibility, Json, Project } from '@/types';

export const ProjectSchema = z.object({
    id: z.string(),
    created_at: z.string().nullable(),
    created_by: z.string(),
    deleted_at: z.string().nullable(),
    deleted_by: z.string().nullable(),
    description: z.string().nullable(),
    is_deleted: z.boolean().nullable(),
    metadata: z.any().nullable() as z.ZodType<Json>,
    name: z.string(),
    organization_id: z.string(),
    owned_by: z.string(),
    settings: z.any().nullable() as z.ZodType<Json>,
    slug: z.string(),
    star_count: z.number().nullable(),
    status: z.enum([
        'active',
        'archived',
        'draft',
        'deleted',
    ]) as z.ZodType<EProjectStatus>,
    tags: z.array(z.string()).nullable(),
    updated_at: z.string().nullable(),
    updated_by: z.string(),
    version: z.number().nullable(),
    visibility: z.enum([
        'private',
        'team',
        'organization',
        'public',
    ]) as z.ZodType<EVisibility>,
}) satisfies z.ZodType<Project>;

export const BlockSchema = z.object({
    id: z.string(),
    content: z.any().nullable() as z.ZodType<Json>,
    created_at: z.string().nullable(),
    created_by: z.string().nullable(),
    deleted_at: z.string().nullable(),
    deleted_by: z.string().nullable(),
    document_id: z.string(),
    is_deleted: z.boolean().nullable(),
    name: z.string(),
    position: z.number(),
    type: z.string(),
    updated_at: z.string().nullable(),
    updated_by: z.string().nullable(),
    version: z.number(),
    org_id: z.string().nullable(),
}) satisfies z.ZodType<Block>;
