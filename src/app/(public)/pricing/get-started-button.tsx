'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { subscribeAction } from '@/actions/stripe'
import { useRouter } from 'next/navigation'

import { loadStripe } from '@stripe/stripe-js'
import { supabase } from '@/lib/supabase/supabaseBrowser'



type Props = {
    userId: string
}

export function GetStartedButton() {
    const router = useRouter();
    const [ isPending, startTransition ] = useTransition()
    const handleClickGetStarted = async () => {
        startTransition(async () => {
            const url = await subscribeAction();
            if (url) {
                router.push(url);
            }else {
                console.error("Failed to create subscription");
            }

        });
    }
    return (
        <div>
        <Button 
        className="w-full" 
        onClick={() => handleClickGetStarted()}
        disabled={isPending}
        >
            {isPending ? "Loading..." : "Get Started"}
        </Button>
        </div>
    );
}