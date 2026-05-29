"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Business = {
  id: string;
  name: string;
  business_type: string;
  plan: string;
  subscription_status: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", userData.user.id)
        .single();

      setBusiness(data);
    };

    load();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Cargando panel...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7fb] px-6 py-8 text-neutral-950">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex justify-between">
          <div>
            <p className="text-sm font-medium text-violet-600">Flowly IA</p>
            <h1 className="mt-2 text-4xl font-semibold">{business.name}</h1>
            <p className="mt-2 text-neutral-600">
              {business.business_type} · Plan {business.plan} · Estado{" "}
              {business.subscription_status}
            </p>
          </div>

          <button
            onClick={logout}
            className="h-fit rounded-full border bg-white px-5 py-3"
          >
            Salir
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Card label="Reservas" value="0" />
          <Card label="Clientes" value="0" />
          <Card label="Servicios" value="0" />
          <Card label="Ingresos" value="0€" />
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">Panel creado correctamente</h2>
          <p className="mt-3 text-neutral-600">
            Este es el panel inicial de tu negocio. El siguiente paso será
            configurar servicios, horarios, empleados y reservas online.
          </p>
        </section>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
