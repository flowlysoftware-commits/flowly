import Link from "next/link";

export default function CondicionesFlowlyPage() {
  return (
    <main className="flowly-public min-h-screen px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Flowly IA · Condiciones de contratación</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Condiciones generales, privacidad y confidencialidad</h1>
        <p className="mt-4 text-white/65">Versión genérica para contratación digital de paneles Flowly IA.</p>

        <section className="mt-8 space-y-6 text-sm leading-7 text-white/72">
          <div><h2 className="text-xl font-semibold text-white">1. Objeto del servicio</h2><p className="mt-2">Flowly IA proporciona una plataforma SaaS modular para la gestión operativa de negocios, incluyendo CRM, agenda, clientes, automatizaciones, WhatsApp, Voice, documentos, formaciones, pagos y otros módulos contratados.</p></div>
          <div><h2 className="text-xl font-semibold text-white">2. Uso autorizado</h2><p className="mt-2">El cliente se compromete a usar Flowly IA únicamente para fines lícitos, profesionales y relacionados con su actividad comercial, manteniendo actualizados sus datos de acceso y evitando compartir credenciales con terceros no autorizados.</p></div>
          <div><h2 className="text-xl font-semibold text-white">3. Confidencialidad</h2><p className="mt-2">Toda la información cargada en Flowly IA, incluyendo datos de clientes, documentos, llamadas, mensajes, citas, facturación y configuraciones internas, será considerada confidencial. Flowly IA no comercializará ni cederá dicha información a terceros salvo obligación legal o necesidad técnica para prestar el servicio.</p></div>
          <div><h2 className="text-xl font-semibold text-white">4. Protección de datos</h2><p className="mt-2">El cliente declara contar con autorización suficiente para introducir datos de terceros en la plataforma. Flowly IA aplicará medidas razonables de seguridad técnica y organizativa para proteger la información alojada en Supabase, Vercel, Stripe y demás proveedores tecnológicos necesarios.</p></div>
          <div><h2 className="text-xl font-semibold text-white">5. Responsabilidad del cliente</h2><p className="mt-2">El cliente es responsable de la exactitud de los datos introducidos, de la gestión de sus usuarios internos, de los mensajes enviados desde sus canales y de cumplir la normativa aplicable a su sector y país.</p></div>
          <div><h2 className="text-xl font-semibold text-white">6. Suscripción y pagos</h2><p className="mt-2">La contratación de Flowly IA puede implicar pagos mensuales, módulos adicionales, instalación o servicios personalizados. El acceso podrá limitarse o suspenderse en caso de impago, uso indebido o incumplimiento de estas condiciones.</p></div>
          <div><h2 className="text-xl font-semibold text-white">7. Disponibilidad y mejoras</h2><p className="mt-2">Flowly IA podrá actualizar, mejorar o modificar módulos para incrementar seguridad, rendimiento o funcionalidad. Se procurará mantener la mayor disponibilidad posible, sin garantizar ausencia absoluta de interrupciones.</p></div>
          <div><h2 className="text-xl font-semibold text-white">8. Aceptación digital</h2><p className="mt-2">Al marcar la casilla de aceptación durante el registro, el cliente confirma que ha leído y acepta estas condiciones de contratación, confidencialidad y privacidad.</p></div>
        </section>

        <Link href="/registro" className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-slate-950">Volver al registro</Link>
      </div>
    </main>
  );
}
