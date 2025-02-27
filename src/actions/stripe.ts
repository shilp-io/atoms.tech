import { stripe } from "@/lib/stripe/stripe"

type Props = {
    userId: string
}

export const subscribeAction = async ({userId}: Props) => {
    try {
        const {url} = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price: 'price_1QvRZALmJyZ4WtyBXqrQaYR3',
                    quantity: 1,
                },
            ],
            metadata: {
                userId,
            },
            mode: "subscription",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        })

        return url
    } catch (error) {
        console.error('Error creating checkout session:', error)
        throw new Error('Failed to create checkout session')
    }
}