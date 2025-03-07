import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/stripe";
import { createClient } from "@/lib/supabase/supabaseServer";

export async function POST(req: Request) {
    try {
        const { priceId, email, userId } = await req.json();

        const supabase = await createClient();

        let customerResponse = await supabase
            .from('stripe_customers')
            .select('stripe_customer_id')
            .eq('id', userId)
            .single();

        let stripeCustomerId = customerResponse.data?.stripe_customer_id;

        if (!stripeCustomerId) {
            console.log("No customer found, creating new one");
            const newCustomer = await stripe.customers.create({
                email: email,
                metadata: { userId: userId },
            });

            await supabase.from('stripe_customers').insert({
                id: userId,
                stripe_customer_id: newCustomer.id,
            });
            stripeCustomerId = newCustomer.id;
        }else {
            console.log("Customer found, using existing one: ", stripeCustomerId);
        }
        
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            metadata: {
                userId: userId,
            },
            payment_method_types: ["card"],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: "subscription",
            success_url: `${req.headers.get('origin')}/api/checkout/success`,
            cancel_url: `${req.headers.get('origin')}/cancel`,
        });

        return NextResponse.json({id: session.id});

    }catch (error: any) {
        console.error(error);
        return NextResponse.json({message: error.message}, {status: 500});
    }
}