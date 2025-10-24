import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceId, mode = 'payment' } = await req.json();
    
    if (!priceId) {
      throw new Error("Price ID is required");
    }

    console.log("Creating checkout session for price:", priceId, "mode:", mode);

    // Get user from auth header if present (optional for checkout)
    let userEmail = null;
    let customerId = null;

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );

      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      
      if (data.user?.email) {
        userEmail = data.user.email;
        console.log("User authenticated:", userEmail);
      }
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists (only if user is authenticated)
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log("Found existing customer:", customerId);
      }
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";

    // Create checkout session with Brazilian payment methods
    const sessionConfig: any = {
      customer: customerId || undefined,
      customer_email: customerId ? undefined : userEmail || undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      payment_method_types: ["card", "boleto"],
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: mode === 'subscription' ? `${origin}/planos` : `${origin}/servicos`,
      locale: "pt-BR",
    };

    // Enable installments for credit cards (Brazil) only for payment mode
    if (mode === "payment") {
      sessionConfig.payment_method_options = {
        card: {
          installments: {
            enabled: true,
          },
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log("Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-checkout:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
