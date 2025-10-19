import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { format } from "https://esm.sh/date-fns@3.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authenticated user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication failed:", authError);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const { appointmentId } = await req.json();

    console.log("Processing webhook for appointment:", appointmentId, "by user:", user.id);

    // Get appointment data
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();

    if (appointmentError) {
      console.error("Failed to fetch appointment:", appointmentError);
      return new Response(
        JSON.stringify({ success: false, error: "Appointment not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Verify appointment ownership or admin status
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!userRole;
    const isOwner = appointment.user_id === user.id;

    if (!isOwner && !isAdmin) {
      console.error("Authorization failed: User", user.id, "attempted to access appointment", appointmentId);
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden: You don't have permission to trigger webhook for this appointment" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    console.log("Authorization passed:", isAdmin ? "Admin access" : "Owner access");

    // Get webhook config
    const { data: config, error: configError } = await supabase
      .from("webhook_config")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (configError) {
      throw new Error(`Failed to fetch webhook config: ${configError.message}`);
    }

    if (!config) {
      console.log("No active webhook configured");
      return new Response(
        JSON.stringify({ success: false, message: "No active webhook configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Format data for webhook - adjust from UTC to Brazil timezone (UTC-3)
    const appointmentDate = new Date(appointment.appointment_date);
    // Convert from UTC to Brazil timezone (subtract 3 hours from UTC)
    const brazilDate = new Date(appointmentDate.getTime() - (3 * 60 * 60 * 1000));
    const dataFormatada = format(brazilDate, "dd/MM/yyyy");
    const horarioFormatado = format(brazilDate, "HH:mm");
    
    const webhookPayload = {
      nome_tutor: appointment.tutor_name,
      telefone: appointment.phone,
      nome_pet: appointment.pet_name,
      servico: appointment.service,
      data: dataFormatada,
      horario: horarioFormatado,
    };

    console.log("Sending to webhook:", config.webhook_url);

    // Send to webhook
    const webhookResponse = await fetch(config.webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    });

    const responseText = await webhookResponse.text();
    const success = webhookResponse.ok;

    console.log("Webhook response:", {
      status: webhookResponse.status,
      success,
      body: responseText,
    });

    // Log the webhook call
    await supabase.from("webhook_logs").insert({
      appointment_id: appointmentId,
      status: success ? "success" : "failed",
      response: responseText,
    });

    return new Response(
      JSON.stringify({
        success,
        status: webhookResponse.status,
        message: success ? "Webhook sent successfully" : "Webhook failed",
        response: responseText,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: success ? 200 : 500,
      }
    );
  } catch (error) {
    console.error("Error in webhook function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});