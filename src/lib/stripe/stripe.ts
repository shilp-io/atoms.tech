import Stripe from "stripe";
import { createClient } from "@/lib/supabase/supabaseServer";

//hardcoded for now
const key = "sk_test_51Qv2aPLmJyZ4WtyBYKnftNME4m4FkKx8CTnjqhKnGTeysu3E4xcgUwEILo0mOqc4nhCiVhASbnAThQEgCOjXDC0X009OV7ebjT"

export const stripe = new Stripe(key, {
    apiVersion: "2025-01-27.acacia",
    typescript: true,
});

// The contents of this function should probably be wrapped in a try/catch
export async function syncStripeDataToDB(customerId: string) {
    const supabase = await createClient();

    //fetch latest subscription data from stripe
    const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 1,
        status: "all",
        expand: ["data.default_payment_method"],
    });

    if (subscriptions.data.length === 0) {
        const subscriptionData = { status: "none" };
        await supabase
            .from("subscriptions")
            .insert({
                id: customerId,
                data: subscriptionData,
            });
        return subscriptionData;
    }

    const subscription = subscriptions.data[0];

    //store complete subscription data
    const subscriptionData = {
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        price_id: subscription.items.data[0].price.id,
        current_period_end: subscription.current_period_end,
        current_period_start: subscription.current_period_start,
        cancel_at_period_end: subscription.cancel_at_period_end,
        payment_method:
            subscription.default_payment_method &&
            typeof subscription.default_payment_method !== "string"
                ? {
                    brand: subscription.default_payment_method.card?.brand ?? null,
                    last4: subscription.default_payment_method.card?.last4 ?? null,
                }
                : null,
    };

    //store in supabase
    await supabase
        .from("subscriptions")
        .upsert({
            id: customerId,
            data: subscriptionData,
        });

    return subscriptionData;
  }