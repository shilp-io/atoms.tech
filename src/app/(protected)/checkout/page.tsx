import { createClient } from "@/lib/supabase/supabaseServer";
import { redirect } from "next/navigation";

export default async function CheckoutSuccessPage() {
    const supabase = createClient();
    const { data: { user } } = await (await supabase).auth.getUser();


    if (!user) {
        return redirect("/login");
    }
    
    console.log(user);
    
}