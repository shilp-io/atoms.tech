import { createClient } from '@/lib/supabase/supabaseServer';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
    console.log('GitHub auth route called');
    const requestUrl = new URL(request.url);
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${requestUrl.origin}/auth/callback`,
        },
      })
      

    if (error) {
        return redirect('/login?error=Could not authenticate with GitHub');
    }

    return redirect(data.url);
}
