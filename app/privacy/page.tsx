import type React from "react";
import Link from "next/link";

export const metadata = {
  title: "Política de privacidad | Flowly IA",
  description: "Política de privacidad de Flowly IA para clientes, usuarios e integraciones conectadas.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[-12%] top-[15%] h-[28rem] w-[28rem] rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[30%] h-[34rem] w-[34rem] rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <section className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 md:py-16">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-3 text-sm font-semibold text-cyan-100 transition hover:text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-[0_0_30px_rgba(34,211,238,.18)]">←</span>
            Volver a Flowly
          </Link>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
            Legal
          </span>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_100px_rgba(0,0,0,.45)] backdrop-blur-2xl md:p-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Flowly IA</p>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">Política de privacidad</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            Esta política explica cómo Flowly IA recopila, utiliza, protege y trata la información de los usuarios, clientes y negocios que usan nuestra plataforma SaaS, nuestros paneles y nuestras integraciones.
          </p>
          <p className="mt-4 text-sm text-slate-400">Última actualización: 13 de junio de 2026</p>
        </div>

        <div className="grid gap-5 md:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-sm text-slate-300 backdrop-blur-xl">
            <p className="mb-3 font-bold text-white">Contenido</p>
            <nav className="flex flex-col gap-2">
              <a href="#responsable" className="hover:text-cyan-200">1. Responsable</a>
              <a href="#datos" className="hover:text-cyan-200">2. Datos tratados</a>
              <a href="#finalidad" className="hover:text-cyan-200">3. Finalidad</a>
              <a href="#confidencialidad" className="hover:text-cyan-200">4. Confidencialidad</a>
              <a href="#integraciones" className="hover:text-cyan-200">5. Integraciones</a>
              <a href="#seguridad" className="hover:text-cyan-200">6. Seguridad</a>
              <a href="#derechos" className="hover:text-cyan-200">7. Derechos</a>
              <a href="#contacto" className="hover:text-cyan-200">8. Contacto</a>
            </nav>
          </aside>

          <article className="space-y-5 text-slate-200">
            <Section id="responsable" title="1. Responsable del tratamiento">
              <p>
                El responsable del tratamiento es Flowly IA, plataforma SaaS para gestión, automatización y digitalización de negocios. Para consultas relacionadas con privacidad puedes contactar en <strong>flowlysoftware@gmail.com</strong>.
              </p>
            </Section>

            <Section id="datos" title="2. Datos que podemos tratar">
              <p>
                Podemos tratar datos de cuenta, identificación, contacto, negocio, clientes, citas, mensajes, documentos, integraciones conectadas, actividad de uso, registros técnicos, información de facturación y cualquier dato que el usuario introduzca voluntariamente en Flowly IA.
              </p>
            </Section>

            <Section id="finalidad" title="3. Para qué usamos los datos">
              <p>
                Utilizamos los datos para prestar el servicio, crear y administrar paneles, permitir el uso de módulos contratados, gestionar CRM, agenda, WhatsApp, automatizaciones, documentos, formaciones, soporte, seguridad, facturación y mejoras del producto.
              </p>
            </Section>

            <Section id="confidencialidad" title="4. Confidencialidad y separación de datos">
              <p>
                Los datos de cada negocio son confidenciales y se mantienen separados de los de otros clientes mediante controles técnicos y lógicos. Flowly IA no vende ni comparte información de clientes con terceros para fines comerciales ajenos al funcionamiento del servicio.
              </p>
            </Section>

            <Section id="integraciones" title="5. Integraciones con terceros">
              <p>
                Flowly IA puede conectarse con servicios externos como Meta, WhatsApp Business, Google, correo electrónico, proveedores de IA, almacenamiento o pasarelas de pago. Estas conexiones solo se activan cuando el usuario las autoriza o configura. Cada integración se utiliza exclusivamente para prestar las funciones solicitadas dentro del panel correspondiente.
              </p>
            </Section>

            <Section id="seguridad" title="6. Seguridad">
              <p>
                Aplicamos medidas razonables de seguridad, autenticación, control de acceso, aislamiento por negocio, almacenamiento seguro y supervisión técnica para proteger la información frente a accesos no autorizados, pérdida, alteración o divulgación indebida.
              </p>
            </Section>

            <Section id="derechos" title="7. Derechos de los usuarios">
              <p>
                Los usuarios pueden solicitar acceso, rectificación, actualización, oposición, limitación o eliminación de sus datos cuando legalmente proceda. También pueden solicitar información sobre el tratamiento de sus datos escribiendo al correo de contacto indicado.
              </p>
            </Section>

            <Section id="contacto" title="8. Contacto">
              <p>
                Para ejercer derechos o realizar consultas sobre privacidad, escribe a <strong>flowlysoftware@gmail.com</strong>. Atenderemos la solicitud dentro de un plazo razonable y conforme a la normativa aplicable.
              </p>
            </Section>
          </article>
        </div>
      </section>
    </main>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="rounded-3xl border border-white/10 bg-white/[0.055] p-6 leading-8 shadow-[0_18px_60px_rgba(0,0,0,.24)] backdrop-blur-xl">
      <h2 className="mb-3 text-xl font-black text-white">{title}</h2>
      <div className="space-y-3 text-slate-300">{children}</div>
    </section>
  );
}
