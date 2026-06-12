import { NextResponse } from "next/server";

type AssistantMessage = { role: "assistant" | "user"; content: string };

type AssistantContext = {
  business?: { name?: string; type?: string | null; plan?: string | null };
  avatar?: { name?: string | null; personality?: string | null };
  activeTab?: string;
  metrics?: Record<string, number>;
  modules?: { key: string; name: string; slug: string }[];
};

const fallbackAnswer = (question: string, context: AssistantContext) => {
  const modules = context.modules?.map((item) => item.name).join(", ") || "agenda, clientes, ajustes y módulos contratados";
  const avatarName = context.avatar?.name || "tu asistente Flowly";

  if (/tour|gu[ií]a|guiame|panel|empezar/i.test(question)) {
    return `Soy ${avatarName}. Para empezar: revisa el dashboard principal, luego agenda, clientes/CRM, recordatorios y después los módulos contratados: ${modules}. Puedes pedirme que te indique dónde está cada sección.`;
  }
  if (/whatsapp|mensaje|plantilla/i.test(question)) {
    return "Para usar WhatsApp entra en el módulo WhatsApp. En Enviar eliges cliente, seleccionas una plantilla o escribes el mensaje libre. En Plantillas puedes crear y eliminar textos reutilizables.";
  }
  if (/cliente|crm|seguimiento/i.test(question)) {
    return `Ahora tienes ${context.metrics?.customers || 0} clientes y ${context.metrics?.upcomingReminders || 0} recordatorios próximos. Te recomiendo revisar clientes sin próxima cita y crear recordatorios de seguimiento.`;
  }
  if (/agenda|cita|reserva/i.test(question)) {
    return `En agenda puedes crear citas con cliente, empleado, servicio y fecha. Actualmente hay ${context.metrics?.appointments || 0} citas registradas y ${context.metrics?.pendingAppointments || 0} pendientes.`;
  }

  return `Soy ${avatarName}. Puedo ayudarte con el panel de ${context.business?.name || "tu negocio"}: agenda, clientes, servicios, recordatorios, WhatsApp, Voice, IA, facturación, TPV, marketing y estadísticas. Pregúntame por una acción concreta y te guío paso a paso.`;
};

export async function POST(request: Request) {
  try {
    const { question, messages = [], context = {} } = (await request.json()) as {
      question?: string;
      messages?: AssistantMessage[];
      context?: AssistantContext;
    };

    if (!question?.trim()) {
      return NextResponse.json({ error: "Falta la pregunta." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ answer: fallbackAnswer(question, context) });
    }

    const systemPrompt = [
      `Eres ${context.avatar?.name || "la Mascota IA de Flowly"}, asistente dentro de un SaaS premium para negocios.`,
      `Personalidad: ${context.avatar?.personality || "cercana, clara, ejecutiva y orientada a acciones"}.`,
      "Habla siempre en español claro y directo.",
      "Tu misión es guiar al usuario por el panel, explicar módulos y recomendar acciones concretas.",
      "No inventes datos que no estén en el contexto. Si una función requiere configuración externa, indícalo.",
      "Sé breve: máximo 6 líneas salvo que pidan pasos detallados.",
      "Contexto del panel:",
      JSON.stringify(context),
    ].join("\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.35,
        max_tokens: 420,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-8).map((message) => ({ role: message.role, content: message.content })),
          { role: "user", content: question },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.warn("Avatar assistant OpenAI warning:", data?.error?.message || data);
      return NextResponse.json({ answer: fallbackAnswer(question, context) });
    }

    const answer = data?.choices?.[0]?.message?.content || fallbackAnswer(question, context);
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Avatar assistant error", error);
    return NextResponse.json({ error: "No se pudo responder desde la Mascota IA." }, { status: 500 });
  }
}
