import Link from "next/link";
import { ArrowRight, Scissors, Store, HeartPulse, Sparkles } from "lucide-react";

const demos = [
  {
    name: "Flowly Hair",
    description: "Panel para peluquerías, barberías y salones.",
    href: "/demo/hair",
    icon: Scissors,
  },
  {
    name: "Flowly Beauty",
    description: "Demo próximamente para estética, uñas y centros beauty.",
    href: "/demo/hair",
    icon: Sparkles,
  },
  {
    name: "Flowly POS",
    description: "TPV interactivo para bares, restaurantes y cafeterías.",
    href: "/demo/restaurant",
    icon: Store,
  },
  {
    name: "Flowly Clinic",
    description: "Gestión para clínicas, fisios, osteópatas y consultas.",
    href: "/demo/clinic",
    icon: HeartPulse,
  },
];

export default function DemoSelectorPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f3e8ff_0%,#ffffff_35%,#f8fafc_100%)] px-6 py-10 text-neutral-950">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold">
            Flowly IA
          </Link>

          <Link
            href="/"
            className="rounded-full border border-neutral-200 bg-white px-5 py-2 text-sm"
          >
            Volver
          </Link>
        </header>

        <section className="text-center">
          <p className="text-sm font-medium text-violet-600">Demos interactivas</p>
          <h1 className="mx-auto mt-4 max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
            Elige el sector que quieres probar
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
            Accede a paneles demo con datos ficticios para ver cómo funcionaría
            Flowly IA en distintos tipos de negocio.
          </p>
        </section>

        <section className="mt-14 grid gap-6 md:grid-cols-2">
          {demos.map((demo) => {
            const Icon = demo.icon;

            return (
              <Link
                key={demo.name}
                href={demo.href}
                className="group rounded-[2rem] border border-neutral-200 bg-white/80 p-7 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <Icon size={26} />
                </div>

                <h2 className="text-2xl font-semibold">{demo.name}</h2>
                <p className="mt-3 text-neutral-600">{demo.description}</p>

                <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm text-white">
                  Entrar en demo <ArrowRight size={16} />
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
