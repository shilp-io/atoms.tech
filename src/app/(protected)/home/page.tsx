import { redirect } from 'next/navigation';
import { getAuthUserServer, getUserOrganizationsServer } from '@/lib/db/server';
import { OrganizationType } from '@/types/base/enums.types';

export default async function HomePage() {
    // Get the current user
    const user = await getAuthUserServer();
    
    // Fetch organizations on the server side
    const organizations = await getUserOrganizationsServer(user.user.id);
    
    // Find personal organization (playground)
    const personalOrg = organizations.find(org => org.type === OrganizationType.personal);
    
    // Find enterprise organization - user is a member of any enterprise org
    const enterpriseOrg = organizations.find(org => org.type === OrganizationType.enterprise);
    
    // Routing logic
    if (enterpriseOrg) {
        // If user is a member of an enterprise org, route to that first
        redirect(`/org/${enterpriseOrg.id}`);
    } else if (personalOrg) {
        // Otherwise, route to personal playground
        redirect(`/org/${personalOrg.id}`);
    } else {
        // If no organizations, redirect to user dashboard
        redirect('/home/user');
    }
    
    // This will never be rendered, but is needed for TypeScript
    return null;
}
