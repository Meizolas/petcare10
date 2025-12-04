import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { format } from "https://esm.sh/date-fns@3.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STATUS_WEBHOOK_URL = "https://webhook.vps.bastmed.com.br/webhook/status";

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

    // Verify admin role
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!userRole) {
      console.error("User is not admin:", user.id);
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden: Admin access required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    const { appointmentId, newStatus } = await req.json();

    console.log("Processing status webhook for appointment:", appointmentId, "new status:", newStatus);

    // Get appointment data
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointment) {
      console.error("Failed to fetch appointment:", appointmentError);
      return new Response(
        JSON.stringify({ success: false, error: "Appointment not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Get user email from auth
    const { data: appointmentUser } = await supabase.auth.admin.getUserById(
      appointment.user_id
    );

    // Format date for webhook - adjust from UTC to Brazil timezone (UTC-3)
    const appointmentDate = new Date(appointment.appointment_date);
    const brazilDate = new Date(appointmentDate.getTime() - (3 * 60 * 60 * 1000));
    const dataFormatada = format(brazilDate, "dd/MM/yyyy");
    const horarioFormatado = format(brazilDate, "HH:mm");

    // Map status to Portuguese
    const statusMap: Record<string, string> = {
      'confirmed': 'aprovado',
      'cancelled': 'recusado',
      'completed': 'finalizado',
      'pending': 'pendente'
    };

    const webhookPayload = {
      nome_tutor: appointment.tutor_name,
      nome_pet: appointment.pet_name,
      telefone: appointment.phone,
      servico: appointment.service,
      data: dataFormatada,
      horario: horarioFormatado,
      status: statusMap[newStatus] || newStatus,
      email: appointmentUser?.user?.email || "",
    };

    console.log("Sending to status webhook:", STATUS_WEBHOOK_URL);
    console.log("Payload:", JSON.stringify(webhookPayload));

    // Send to webhook
    const webhookResponse = await fetch(STATUS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    });

    const responseText = await webhookResponse.text();
    const success = webhookResponse.ok;

    console.log("Status webhook response:", {
      status: webhookResponse.status,
      success,
      body: responseText,
    });

    // Log the webhook call
    await supabase.from("webhook_logs").insert({
      appointment_id: appointmentId,
      status: success ? "success" : "failed",
      response: `Status change to ${newStatus}: ${responseText}`,
    });

    return new Response(
      JSON.stringify({
        success,
        status: webhookResponse.status,
        message: success ? "Status webhook sent successfully" : "Status webhook failed",
        response: responseText,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: success ? 200 : 500,
      }
    );
  } catch (error) {
    console.error("Error in status webhook function:", error);
    
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
