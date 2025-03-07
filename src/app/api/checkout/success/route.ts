import { createClient } from "@/lib/supabase/supabaseServer";
import { redirect } from "next/navigation";
import { syncStripeDataToDB } from "@/lib/stripe/stripe";
export async function GET(req: Request) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
        return redirect("/");
    }

    const stripeCustomerId = await supabase
        .from("stripe_customers")
        .select("stripe_customer_id")
        .eq("id", data.user.id)
        .single();

    if (!stripeCustomerId) {
      return redirect("/");
    }
  
    await syncStripeDataToDB(stripeCustomerId.data?.stripe_customer_id);
    console.log("Syncing stripe data to DB, stripeCustomerId: ", stripeCustomerId.data?.stripe_customer_id);
    return redirect("/");
  }