import { updateSession } from '@/lib/supabase/middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
    // // Skip middleware for webhook routes
    // if (request.nextUrl.pathname.startsWith('/api/webhook') || 
    //     request.nextUrl.pathname.startsWith('/api/test')) {
    //     return NextResponse.next();
    // }
    
    // // Continue with session handling for all other routes
    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - /api/webhook or /api/test routes
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!api/webhook|api/test|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
