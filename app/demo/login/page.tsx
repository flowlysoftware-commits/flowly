"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import Link from "next/link";

export default function DemoLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@flowlyia.com");
  const [password, setPassword] = useState("flowlydemo");

  const login = () => {
    if (email === "demo@flowlyia.com" && password === "flowlydemo") {
      localStorage.setItem("flowly_demo_access", "true");
      router.push("/demo");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#f3e8ff_0%,#ffffff_35%,#f8fafc_100%)] px-6">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl shadow-violet-100">
        <Link href="/" className="text-sm text-neutral-500">
          ← Volver a Flowly IA
        </Link>

        <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
          <LockKeyhole />
        </div>

        <h1 className="mt-6 text-3xl font-semibold">Acceso demo</h1>

        <p className="mt-2 text-neutral-600">
          Entra al selector de demos y prueba los paneles de Flowly Hair,
          Flowly POS y Flowly Clinic.
        </p>

        <div className="mt-6 rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
          <p>
            <strong>Usuario:</strong> demo@flowlyia.com
          </p>
          <p>
            <strong>Contraseña:</strong> flowlydemo
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="rounded-2xl border px-4 py-3 outline-none"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            type="password"
            className="rounded-2xl border px-4 py-3 outline-none"
          />
        </div>

        <button
          onClick={login}
          className="mt-6 w-full rounded-full bg-neutral-950 px-6 py-4 text-white"
        >
          Entrar a las demos
        </button>
      </div>
    </main>
  );
}
