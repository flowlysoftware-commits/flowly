"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function RegistroPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f8f7fb]">
          Cargando...
        </main>
      }
    >
      <RegistroContent />
    </Suspense>
  );
}

function RegistroContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Peluquería");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const createAccount = async () => {
    if (!sessionId || !businessName || !password) {
      alert("Faltan datos");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        businessName,
        businessType,
        password,
      }),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
    } else {
      alert("Cuenta creada correctamente. Ahora inicia sesión.");
      router.push("/login");
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7fb] px-6">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold">Configura tu cuenta</h1>

        <p className="mt-2 text-neutral-600">
          Tu suscripción está activa. Ahora crea tu acceso al panel.
        </p>

        <div className="mt-6 grid gap-4">
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Nombre del negocio"
            className="rounded-2xl border px-4 py-3"
          />

          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="rounded-2xl border px-4 py-3"
          >
            <option>Peluquería</option>
            <option>Estética</option>
            <option>Restaurante</option>
            <option>Clínica</option>
            <option>Academia</option>
            <option>Otro</option>
          </select>

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Crear contraseña"
            className="rounded-2xl border px-4 py-3"
          />
        </div>

        <button
          onClick={createAccount}
          disabled={loading}
          className="mt-6 w-full rounded-full bg-neutral-950 px-6 py-4 text-white disabled:opacity-60"
        >
          {loading ? "Creando..." : "Crear mi panel"}
        </button>
      </div>
    </main>
  );
}
