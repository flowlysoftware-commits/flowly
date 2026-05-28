"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Users,
  Euro,
  Scissors,
  Plus,
  LogOut,
  CheckCircle2,
} from "lucide-react";

type Appointment = {
  id: number;
  client: string;
  service: string;
  time: string;
  employee: string;
  status: string;
  price: number;
};

const initialAppointments: Appointment[] = [
  {
    id: 1,
    client: "Laura Martínez",
    service: "Corte + peinado",
    time: "10:30",
    employee: "María",
    status: "Pendiente",
    price: 35,
  },
  {
    id: 2,
    client: "Ana López",
    service: "Color completo",
    time: "12:00",
    employee: "Sofía",
    status: "Pendiente",
    price: 68,
  },
  {
    id: 3,
    client: "Carlos Ruiz",
    service: "Barba premium",
    time: "13:45",
    employee: "Alex",
    status: "Confirmada",
    price: 22,
  },
];

export default function FlowlyHairDemoPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [open, setOpen] = useState(false);

  const [client, setClient] = useState("");
  const [service, setService] = useState("Corte + peinado");
  const [time, setTime] = useState("");
  const [employee, setEmployee] = useState("María");
  const [price, setPrice] = useState("35");

  useEffect(() => {
    const hasAccess = localStorage.getItem("flowly_demo_access");
    if (hasAccess !== "true") {
      router.push("/demo/login");
    }
  }, [router]);

  const confirmAppointment = (id: number) => {
    setAppointments((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "Confirmada" } : item
      )
    );
  };

  const createAppointment = () => {
    if (!client || !time) return alert("Faltan datos");

    setAppointments([
      {
        id: Date.now(),
        client,
        service,
        time,
        employee,
        status: "Pendiente",
        price: Number(price),
      },
      ...appointments,
    ]);

    setClient("");
    setTime("");
    setOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("flowly_demo_access");
    router.push("/");
  };

  const todayRevenue = appointments.reduce((sum, a) => sum + a.price, 0);
  const confirmed = appointments.filter((a) => a.status === "Confirmada").length;

  return (
    <main className="min-h-screen bg-[#f8f7fb] text-neutral-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-neutral-200 bg-white p-6 md:block">
          <h1 className="text-xl font-semibold">Flowly Hair</h1>
          <p className="mt-1 text-sm text-neutral-500">Demo interactiva</p>

          <nav className="mt-10 space-y-2 text-sm">
            <div className="rounded-2xl bg-neutral-950 px-4 py-3 text-white">
              Dashboard
            </div>
            <div className="rounded-2xl px-4 py-3 text-neutral-600">
              Citas
            </div>
            <div className="rounded-2xl px-4 py-3 text-neutral-600">
              Clientes
            </div>
            <div className="rounded-2xl px-4 py-3 text-neutral-600">
              Servicios
            </div>
            <div className="rounded-2xl px-4 py-3 text-neutral-600">
              Estadísticas
            </div>
          </nav>
        </aside>

        <section className="flex-1 px-6 py-8">
          <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-violet-600">
                Demo · Peluquería
              </p>
              <h2 className="mt-2 text-4xl font-semibold">
                Panel Flowly Hair Studio
              </h2>
              <p className="mt-2 text-neutral-600">
                Explora citas, clientes, ingresos y automatizaciones.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setOpen(true)}
                className="rounded-full bg-neutral-950 px-5 py-3 text-white"
              >
                <Plus size={18} className="inline" /> Nueva cita
              </button>

              <button
                onClick={logout}
                className="rounded-full border bg-white px-5 py-3 text-neutral-700"
              >
                <LogOut size={18} className="inline" /> Salir
              </button>
            </div>
          </header>

          <section className="mb-8 grid gap-4 md:grid-cols-4">
            <Card icon={<CalendarDays />} label="Citas hoy" value={appointments.length} />
            <Card icon={<Euro />} label="Ingresos estimados" value={`${todayRevenue} €`} />
            <Card icon={<Users />} label="Clientes activos" value="842" />
            <Card icon={<Scissors />} label="Confirmadas" value={confirmed} />
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[2rem] bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Agenda de hoy</h3>

              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col justify-between gap-3 rounded-2xl border border-neutral-100 p-4 md:flex-row md:items-center"
                  >
                    <div>
                      <p className="font-medium">{appointment.client}</p>
                      <p className="text-sm text-neutral-500">
                        {appointment.service} · {appointment.employee} ·{" "}
                        {appointment.time}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs">
                        {appointment.status}
                      </span>

                      <span className="font-semibold">{appointment.price} €</span>

                      <button
                        onClick={() => confirmAppointment(appointment.id)}
                        className="rounded-full border border-green-200 px-3 py-2 text-xs text-green-700"
                      >
                        <CheckCircle2 size={14} className="inline" /> Confirmar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-neutral-950 p-6 text-white shadow-sm">
              <h3 className="text-lg font-semibold">Automatizaciones</h3>
              <div className="mt-5 space-y-3 text-sm text-white/70">
                <div className="rounded-2xl bg-white/10 p-4">
                  Recordatorio WhatsApp 24h antes
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  Mensaje post-cita automático
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  Aviso de cliente inactivo
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  Confirmación automática de reserva
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold">Nueva cita demo</h2>

            <div className="mt-6 grid gap-4">
              <input
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Cliente"
                className="rounded-2xl border px-4 py-3"
              />

              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="rounded-2xl border px-4 py-3"
              >
                <option>Corte + peinado</option>
                <option>Color completo</option>
                <option>Barba premium</option>
                <option>Tratamiento capilar</option>
              </select>

              <input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Hora, ejemplo 16:30"
                className="rounded-2xl border px-4 py-3"
              />

              <select
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                className="rounded-2xl border px-4 py-3"
              >
                <option>María</option>
                <option>Sofía</option>
                <option>Alex</option>
              </select>

              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Precio"
                type="number"
                className="rounded-2xl border px-4 py-3"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-full border px-5 py-3"
              >
                Cancelar
              </button>

              <button
                onClick={createAppointment}
                className="rounded-full bg-neutral-950 px-5 py-3 text-white"
              >
                Crear cita
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Card({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
        {icon}
      </div>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
