import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/stripe";

export async function POST(req: Request) {
    try {
        const { priceId, email, userId } = await req.json();

        const session = await stripe.checkout.sessions.create({
            metadata: {
                userId: userId,
            },
            customer_email: email,
            payment_method_types: ["card"],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: "subscription",
            success_url: `${req.headers.get('origin')}/success`,
            cancel_url: `${req.headers.get('origin')}/cancel`,
        });

        return NextResponse.json({id: session.id});

    }catch (error: any) {
        console.error(error);
        return NextResponse.json({message: error.message}, {status: 500});
    }
}