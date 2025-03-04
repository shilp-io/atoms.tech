'use client';

import { loadStripe } from '@stripe/stripe-js'
import { supabase } from '@/lib/supabase/supabaseBrowser'
import { Button } from '@/components/ui/button'

export default function CheckoutButton() {
    const handleCheckout = async () => {
        const { data } = await supabase.auth.getUser();

        if (!data.user) {
            console.error("User not found");
            return;
        }

        const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        const stripe = await stripePromise;
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                priceId: 'price_1QvRZALmJyZ4WtyBXqrQaYR3',
                userId: data.user?.id,
                email: data.user?.email,
            })
        });

        const session = await response.json();
        await stripe?.redirectToCheckout({ sessionId: session.id });

    }
        
    return (
        <Button className="w-full" onClick={handleCheckout}>
            {"Get Started"}
        </Button>
    );
    
}