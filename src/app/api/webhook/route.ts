import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/stripe";
// import { createClient } from "@/lib/supabase/supabaseServer";
import { supabase } from "@/lib/supabase/supabaseBrowser";
import Stripe from "stripe";

// const supabase = await createClient();

export async function POST(request: NextRequest) {
    console.log('Webhook received');
    try {
        const rawBody = await request.text();
        const sig = request.headers.get('stripe-signature');

        let event;
        try {
            event = stripe.webhooks.constructEvent(rawBody, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
        } catch (error:any) {
            console.error(`Webhook signature verification failed. ${error.message}`);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // Handle the checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session: Stripe.Checkout.Session = event.data.object;
            console.log('Session:', session);

            const userId = session.metadata?.userId;

            const { error } = await supabase
                .from('stripe_customers')
                .upsert({
                    id: userId,
                    stripe_customer_id: session.customer,
                    stripe_subscription_id: session.subscription,
                    subscription_status: null,
                })

            if (error) {
                console.error('Error inserting stripe customer:', error);
                return NextResponse.json({ message: error.message }, { status: 500 });
            }

            return NextResponse.json({ message: 'success'})
        }

        if (event.type === 'customer.subscription.updated') {

        }

        if (event.type === 'customer.subscription.deleted') {

        }


        return NextResponse.json({ message: 'success'})

    } catch (error: any) {
        console.error('Error processing webhook:', error);
    }
}