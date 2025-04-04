export interface Invitation {
    id: string;
    organization_id: string;
    user_email: string;
    user_role_type: string;
    status: string;
    created_at: string;
    updated_at?: string;
    updated_by?: string;
}
