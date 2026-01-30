import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  agentType?: "sales" | "support" | "services" | "marketing" | "custom";
  customPrompt?: string;
  model?: string;
}

const agentPrompts = {
  sales: `Eres un experto agente de ventas para WhatsApp. Tu objetivo es:
- Generar interés en los productos/servicios
- Responder preguntas sobre precios y características
- Guiar al cliente hacia la compra
- Cerrar ventas de manera natural y amigable
- Usar técnicas de persuasión éticas
Mantén un tono profesional pero cercano. Responde siempre en español.`,

  support: `Eres un agente de soporte técnico para WhatsApp. Tu objetivo es:
- Resolver dudas y problemas técnicos
- Proporcionar soluciones paso a paso
- Escalar problemas complejos cuando sea necesario
- Mantener la satisfacción del cliente
- Ser paciente y empático
Responde de forma clara y concisa. Responde siempre en español.`,

  services: `Eres un asistente de servicios para WhatsApp. Tu objetivo es:
- Agendar citas y reservaciones
- Informar sobre disponibilidad de servicios
- Gestionar modificaciones y cancelaciones
- Recordar políticas relevantes
- Ofrecer alternativas cuando no hay disponibilidad
Sé organizado y eficiente. Responde siempre en español.`,

  marketing: `Eres un agente de marketing para WhatsApp. Tu objetivo es:
- Promocionar ofertas y descuentos especiales
- Generar engagement con los clientes
- Informar sobre nuevos productos/servicios
- Crear urgencia de manera ética
- Personalizar las ofertas según el cliente
Sé creativo y entusiasta. Responde siempre en español.`,

  custom: `Eres un asistente inteligente para WhatsApp. Ayuda a los usuarios con sus consultas de manera profesional, amable y eficiente. Responde siempre en español.`
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, agentType = "custom", customPrompt, model = "google/gemini-3-flash-preview" }: ChatRequest = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt
    const systemPrompt = customPrompt || agentPrompts[agentType] || agentPrompts.custom;

    console.log(`Processing chat request with agent type: ${agentType}, model: ${model}`);
    console.log(`Messages count: ${messages.length}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI gateway error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de solicitudes excedido. Intenta de nuevo más tarde." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Añade más créditos a tu workspace." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "Error al procesar la solicitud de IA" }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Streaming response from AI gateway");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
