import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationUrl }: ConfirmationEmailRequest = await req.json();

    console.log("Sending confirmation email to:", email);

    const emailHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme seu Cadastro | PetCare</title>
  <style>
    body {
      font-family: 'Poppins', Arial, sans-serif;
      background-color: #f9f9fb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(90deg, #8b5cf6, #7c3aed);
      color: white;
      text-align: center;
      padding: 32px 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    .content {
      padding: 32px 24px;
      color: #333;
      line-height: 1.6;
    }
    .content h2 {
      color: #1e1e2f;
      font-size: 20px;
      margin-bottom: 12px;
    }
    .content p {
      margin-bottom: 20px;
      font-size: 15px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(90deg, #8b5cf6, #7c3aed);
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 30px;
      font-weight: 600;
      font-size: 15px;
      transition: background 0.3s ease;
    }
    .button:hover {
      opacity: 0.9;
    }
    .footer {
      background: #f4f4f8;
      text-align: center;
      padding: 20px;
      font-size: 13px;
      color: #777;
    }
    .logo {
      width: 50px;
      height: 50px;
      margin-bottom: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://i.imgur.com/YbRbphl.png" alt="PetCare Logo" class="logo">
      <h1>Bem-vindo(a) ao PetCare!</h1>
    </div>
    <div class="content">
      <h2>Confirme seu Cadastro</h2>
      <p>Olá! Estamos muito felizes em ter você com a gente 🐾</p>
      <p>Para ativar sua conta e aproveitar todos os nossos serviços, por favor confirme seu e-mail clicando no botão abaixo:</p>
      <p style="text-align:center;">
        <a href="${confirmationUrl}" class="button">Confirmar E-mail</a>
      </p>
      <p>Se você não criou uma conta no PetCare, ignore esta mensagem.</p>
    </div>
    <div class="footer">
      <p>© 2025 PetCare. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: "PetCare <onboarding@resend.dev>",
      to: [email],
      subject: "Confirme seu cadastro no PetCare",
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
