import { Json } from './database.types';
import {
    RequirementFormat,
    RequirementLevel,
    RequirementPriority,
    RequirementStatus,
} from './enums.types';

export type Requirement = {
    id: string;
    ai_analysis: Json | null;
    block_id: string;
    created_at: string | null;
    created_by: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    description: string | null;
    document_id: string;
    enchanced_requirement: string | null;
    external_id: string | null;
    format: RequirementFormat;
    is_deleted: boolean | null;
    level: RequirementLevel;
    name: string;
    original_requirement: string | null;
    priority: RequirementPriority;
    status: RequirementStatus;
    tags: string[] | null;
    updated_at: string | null;
    updated_by: string | null;
    version: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: Record<string, any> | null;
};

export type RequirementPropertyKV = {
    key: string;
    value: string;
};
