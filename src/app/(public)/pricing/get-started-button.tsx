'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { subscribeAction } from '@/actions/stripe'
import { useRouter } from 'next/navigation'

type Props = {
    userId: string
}

export function GetStartedButton({userId}: Props) {
    const router = useRouter();
    const [ isPending, startTransition ] = useTransition()
    const handleClickGetStarted = async () => {
        startTransition(async () => {
            const url = await subscribeAction({userId});
            if (url) {
                router.push(url);
            }else {
                console.error("Failed to create subscription");
            }

        });
    }
    return (
        <Button 
        className="w-full" 
        onClick={() => handleClickGetStarted()}
        disabled={isPending}
        >
            {isPending ? "Loading..." : "Get Started"}
        </Button>
    );
}