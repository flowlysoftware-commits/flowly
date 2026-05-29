"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  Euro,
  LogOut,
  MessageCircle,
  Plus,
  Scissors,
  Settings2,
  Sparkles,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

type Tab =
  | "Dashboard"
  | "Agenda"
  | "Clientes"
  | "Servicios"
  | "Automatizaciones"
  | "Estadísticas";

type Appointment = {
  id: number;
  client: string;
  service: string;
  time: string;
  employee: string;
  status: "Pendiente" | "Confirmada" | "Cancelada";
  price: number;
};

type Client = {
  id: number;
  name: string;
  phone: string;
  lastVisit: string;
  visits: number;
  spent: number;
};

type Service = {
  id: number;
  name: string;
  category: string;
  duration: string;
  price: number;
  active: boolean;
};

type Automation = {
  id: number;
  name: string;
  description: string;
  active: boolean;
};

const initialAppointments: Appointment[] = [
  { id: 1, client: "Laura Martínez", service: "Corte + peinado", time: "09:30", employee: "María", status: "Confirmada", price: 35 },
  { id: 2, client: "Ana López", service: "Color completo", time: "11:00", employee: "Sofía", status: "Pendiente", price: 68 },
  { id: 3, client: "Carlos Ruiz", service: "Barba premium", time: "12:45", employee: "Alex", status: "Confirmada", price: 22 },
  { id: 4, client: "Marta Gómez", service: "Balayage", time: "16:00", employee: "María", status: "Pendiente", price: 120 },
];

const initialClients: Client[] = [
  { id: 1, name: "Laura Martínez", phone: "611 234 567", lastVisit: "Hoy", visits: 12, spent: 420 },
  { id: 2, name: "Ana López", phone: "622 987 111", lastVisit: "Hace 4 días", visits: 8, spent: 690 },
  { id: 3, name: "Carlos Ruiz", phone: "633 456 888", lastVisit: "Hace 7 días", visits: 5, spent: 180 },
  { id: 4, name: "Marta Gómez", phone: "644 111 222", lastVisit: "Hace 12 días", visits: 15, spent: 980 },
];

const initialServices: Service[] = [
  { id: 1, name: "Corte mujer", category: "Peluquería", duration: "45 min", price: 35, active: true },
  { id: 2, name: "Color completo", category: "Color", duration: "90 min", price: 68, active: true },
  { id: 3, name: "Balayage", category: "Color premium", duration: "150 min", price: 120, active: true },
  { id: 4, name: "Barba premium", category: "Barbería", duration: "30 min", price: 22, active: true },
];

const initialAutomations: Automation[] = [
  { id: 1, name: "Confirmación automática", description: "Envía WhatsApp al crear una reserva.", active: true },
  { id: 2, name: "Recordatorio 24h antes", description: "Reduce ausencias con aviso previo.", active: true },
  { id: 3, name: "Mensaje post-cita", description: "Pide reseña o recomienda próxima visita.", active: false },
  { id: 4, name: "Clientes inactivos", description: "Recupera clientes que llevan 45 días sin venir.", active: true },
];

const monthlyRevenue = [
  { month: "Ene", value: 8200 },
  { month: "Feb", value: 9600 },
  { month: "Mar", value: 11200 },
  { month: "Abr", value: 10400 },
  { month: "May", value: 12450 },
  { month: "Jun", value: 13800 },
];

export default function FlowlyHairDemoPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [automations, setAutomations] = useState<Automation[]>(initialAutomations);

  const [openAppointment, setOpenAppointment] = useState(false);
  const [openClient, setOpenClient] = useState(false);
  const [toast, setToast] = useState("");

  const [client, setClient] = useState("");
  const [service, setService] = useState("Corte mujer");
  const [time, setTime] = useState("");
  const [employee, setEmployee] = useState("María");
  const [price, setPrice] = useState("35");

  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");

  useEffect(() => {
    const access = localStorage.getItem("flowly_demo_access");
    if (access !== "true") router.push("/demo/login");
  }, [router]);

  const activeAppointments = appointments.filter((a) => a.status !== "Cancelada");
  const confirmedAppointments = appointments.filter((a) => a.status === "Confirmada");
  const estimatedRevenue = activeAppointments.reduce((sum, a) => sum + a.price, 0);
  const activeAutomations = automations.filter((a) => a.active).length;

  const topServices = useMemo(() => {
    return [...services].sort((a, b) => b.price - a.price).slice(0, 3);
  }, [services]);

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  const logout = () => {
    localStorage.removeItem("flowly_demo_access");
    router.push("/");
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
    setOpenAppointment(false);
    notify("Cita creada correctamente");
  };

  const createClient = () => {
    if (!newClientName || !newClientPhone) return alert("Faltan datos");

    setClients([
      {
        id: Date.now(),
        name: newClientName,
        phone: newClientPhone,
        lastVisit: "Nuevo",
        visits: 0,
        spent: 0,
      },
      ...clients,
    ]);

    setNewClientName("");
    setNewClientPhone("");
    setOpenClient(false);
    notify("Cliente añadido correctamente");
  };

  const updateAppointmentStatus = (id: number, status: Appointment["status"]) => {
    setAppointments((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
    notify(`Cita marcada como ${status.toLowerCase()}`);
  };

  const toggleService = (id: number) => {
    setServices((current) =>
      current.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
    notify("Servicio actualizado");
  };

  const toggleAutomation = (id: number) => {
    setAutomations((current) =>
      current.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
    notify("Automatización actualizada");
  };

  return (
    <main className="min-h-screen bg-[#f8f7fb] text-neutral-950">
      {toast && (
        <div className="fixed right-6 top-6 z-[60] rounded-full bg-neutral-950 px-5 py-3 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}

      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-neutral-200 bg-white p-6 md:block">
          <div>
            <h1 className="text-xl font-semibold">Flowly Hair</h1>
            <p className="mt-1 text-sm text-neutral-500">Demo interactiva</p>
          </div>

          <nav className="mt-10 space-y-2 text-sm">
            {[
              ["Dashboard", BarChart3],
              ["Agenda", CalendarDays],
              ["Clientes", Users],
              ["Servicios", Scissors],
              ["Automatizaciones", Sparkles],
              ["Estadísticas", Euro],
            ].map(([label, Icon]) => (
              <button
                key={String(label)}
                onClick={() => setActiveTab(label as Tab)}
                className={
                  activeTab === label
                    ? "flex w-full items-center gap-3 rounded-2xl bg-neutral-950 px-4 py-3 text-white"
                    : "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-neutral-600 hover:bg-neutral-50"
                }
              >
                <Icon size={18} />
                {label as string}
              </button>
            ))}
          </nav>

          <div className="mt-10 rounded-3xl bg-violet-50 p-5 text-sm text-violet-800">
            <p className="font-semibold">Modo demo</p>
            <p className="mt-2 text-violet-700">
              Puedes tocar botones, crear citas y probar el panel sin afectar datos reales.
            </p>
          </div>
        </aside>

        <section className="flex-1 px-6 py-8">
          <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-violet-600">Demo · Peluquería</p>
              <h2 className="mt-2 text-4xl font-semibold">Panel Flowly Hair Studio</h2>
              <p className="mt-2 text-neutral-600">
                Gestiona citas, clientes, servicios, automatizaciones y métricas.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setOpenAppointment(true)}
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

          <div className="mb-6 flex gap-2 overflow-x-auto md:hidden">
            {["Dashboard", "Agenda", "Clientes", "Servicios", "Automatizaciones", "Estadísticas"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as Tab)}
                className={
                  activeTab === tab
                    ? "rounded-full bg-neutral-950 px-4 py-2 text-sm text-white"
                    : "rounded-full border bg-white px-4 py-2 text-sm text-neutral-600"
                }
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Dashboard" && (
            <>
              <section className="mb-8 grid gap-4 md:grid-cols-4">
                <Card icon={<CalendarDays />} label="Citas activas" value={activeAppointments.length} />
                <Card icon={<Euro />} label="Ingresos estimados" value={`${estimatedRevenue} €`} />
                <Card icon={<Users />} label="Clientes activos" value={clients.length} />
                <Card icon={<Sparkles />} label="Automatizaciones" value={activeAutomations} />
              </section>

              <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                <Panel title="Agenda de hoy">
                  <AppointmentList
                    appointments={appointments}
                    updateAppointmentStatus={updateAppointmentStatus}
                    compact
                  />
                </Panel>

                <Panel dark title="Resumen inteligente">
                  <div className="space-y-3 text-sm text-white/75">
                    <div className="rounded-2xl bg-white/10 p-4">
                      Hoy tienes {activeAppointments.length} citas y una previsión de {estimatedRevenue} €.
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      El servicio con mayor ticket es {topServices[0]?.name}.
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      {activeAutomations} automatizaciones están activas.
                    </div>
                  </div>
                </Panel>
              </section>
            </>
          )}

          {activeTab === "Agenda" && (
            <Panel title="Agenda completa">
              <div className="mb-5 flex justify-between gap-4">
                <p className="text-sm text-neutral-500">Crea, confirma o cancela citas de prueba.</p>
                <button
                  onClick={() => setOpenAppointment(true)}
                  className="rounded-full bg-neutral-950 px-4 py-2 text-sm text-white"
                >
                  + Nueva cita
                </button>
              </div>
              <AppointmentList
                appointments={appointments}
                updateAppointmentStatus={updateAppointmentStatus}
              />
            </Panel>
          )}

          {activeTab === "Clientes" && (
            <Panel title="Clientes">
              <div className="mb-5 flex justify-between gap-4">
                <p className="text-sm text-neutral-500">Historial y valor de clientes.</p>
                <button
                  onClick={() => setOpenClient(true)}
                  className="rounded-full bg-neutral-950 px-4 py-2 text-sm text-white"
                >
                  <UserPlus size={16} className="inline" /> Nuevo cliente
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-neutral-500">
                    <tr>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Última visita</th>
                      <th className="p-4">Visitas</th>
                      <th className="p-4">Total gastado</th>
                      <th className="p-4">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((c) => (
                      <tr key={c.id} className="border-t">
                        <td className="p-4">
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-neutral-500">{c.phone}</p>
                        </td>
                        <td className="p-4">{c.lastVisit}</td>
                        <td className="p-4">{c.visits}</td>
                        <td className="p-4 font-semibold">{c.spent} €</td>
                        <td className="p-4">
                          <button
                            onClick={() => notify(`Abriendo ficha de ${c.name}`)}
                            className="rounded-full border px-3 py-2 text-xs"
                          >
                            Ver ficha
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {activeTab === "Servicios" && (
            <Panel title="Servicios">
              <div className="grid gap-4 md:grid-cols-2">
                {services.map((s) => (
                  <div key={s.id} className="rounded-3xl border border-neutral-100 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{s.name}</h3>
                        <p className="mt-1 text-sm text-neutral-500">
                          {s.category} · {s.duration}
                        </p>
                      </div>
                      <p className="text-xl font-semibold">{s.price} €</p>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <span
                        className={
                          s.active
                            ? "rounded-full bg-green-50 px-3 py-1 text-xs text-green-700"
                            : "rounded-full bg-red-50 px-3 py-1 text-xs text-red-700"
                        }
                      >
                        {s.active ? "Activo" : "Inactivo"}
                      </span>

                      <button
                        onClick={() => toggleService(s.id)}
                        className="rounded-full border px-4 py-2 text-xs"
                      >
                        {s.active ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {activeTab === "Automatizaciones" && (
            <Panel title="Automatizaciones">
              <div className="grid gap-4 md:grid-cols-2">
                {automations.map((a) => (
                  <div key={a.id} className="rounded-3xl border border-neutral-100 p-5">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{a.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-neutral-500">
                          {a.description}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleAutomation(a.id)}
                        className={
                          a.active
                            ? "h-8 w-14 rounded-full bg-violet-600 p-1"
                            : "h-8 w-14 rounded-full bg-neutral-200 p-1"
                        }
                      >
                        <span
                          className={
                            a.active
                              ? "block h-6 w-6 translate-x-6 rounded-full bg-white transition"
                              : "block h-6 w-6 rounded-full bg-white transition"
                          }
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {activeTab === "Estadísticas" && (
            <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <Panel title="Ingresos mensuales">
                <div className="flex h-72 items-end gap-3">
                  {monthlyRevenue.map((item) => (
                    <div key={item.month} className="flex flex-1 flex-col items-center gap-3">
                      <div
                        className="w-full rounded-t-2xl bg-gradient-to-t from-violet-600 to-pink-300"
                        style={{ height: `${(item.value / 14000) * 100}%` }}
                      />
                      <p className="text-xs text-neutral-500">{item.month}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Top servicios">
                <div className="space-y-3">
                  {topServices.map((s, index) => (
                    <div key={s.id} className="rounded-2xl bg-neutral-50 p-4">
                      <p className="text-sm font-medium">
                        #{index + 1} {s.name}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        Ticket medio: {s.price} €
                      </p>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>
          )}
        </section>
      </div>

      {openAppointment && (
        <Modal title="Nueva cita demo" onClose={() => setOpenAppointment(false)}>
          <div className="grid gap-4">
            <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Cliente" className="rounded-2xl border px-4 py-3" />
            <select value={service} onChange={(e) => setService(e.target.value)} className="rounded-2xl border px-4 py-3">
              {services.filter((s) => s.active).map((s) => (
                <option key={s.id}>{s.name}</option>
              ))}
            </select>
            <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="Hora, ejemplo 16:30" className="rounded-2xl border px-4 py-3" />
            <select value={employee} onChange={(e) => setEmployee(e.target.value)} className="rounded-2xl border px-4 py-3">
              <option>María</option>
              <option>Sofía</option>
              <option>Alex</option>
            </select>
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Precio" type="number" className="rounded-2xl border px-4 py-3" />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setOpenAppointment(false)} className="rounded-full border px-5 py-3">
              Cancelar
            </button>
            <button onClick={createAppointment} className="rounded-full bg-neutral-950 px-5 py-3 text-white">
              Crear cita
            </button>
          </div>
        </Modal>
      )}

      {openClient && (
        <Modal title="Nuevo cliente demo" onClose={() => setOpenClient(false)}>
          <div className="grid gap-4">
            <input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Nombre del cliente" className="rounded-2xl border px-4 py-3" />
            <input value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} placeholder="Teléfono" className="rounded-2xl border px-4 py-3" />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setOpenClient(false)} className="rounded-full border px-5 py-3">
              Cancelar
            </button>
            <button onClick={createClient} className="rounded-full bg-neutral-950 px-5 py-3 text-white">
              Crear cliente
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

function AppointmentList({
  appointments,
  updateAppointmentStatus,
  compact = false,
}: {
  appointments: Appointment[];
  updateAppointmentStatus: (id: number, status: Appointment["status"]) => void;
  compact?: boolean;
}) {
  return (
    <div className="space-y-3">
      {appointments.slice(0, compact ? 4 : appointments.length).map((appointment) => (
        <div
          key={appointment.id}
          className="flex flex-col justify-between gap-3 rounded-2xl border border-neutral-100 p-4 md:flex-row md:items-center"
        >
          <div>
            <p className="font-medium">{appointment.client}</p>
            <p className="text-sm text-neutral-500">
              {appointment.service} · {appointment.employee} · {appointment.time}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs">
              {appointment.status}
            </span>

            <span className="font-semibold">{appointment.price} €</span>

            {appointment.status !== "Confirmada" && (
              <button
                onClick={() => updateAppointmentStatus(appointment.id, "Confirmada")}
                className="rounded-full border border-green-200 px-3 py-2 text-xs text-green-700"
              >
                <CheckCircle2 size={14} className="inline" /> Confirmar
              </button>
            )}

            {appointment.status !== "Cancelada" && (
              <button
                onClick={() => updateAppointmentStatus(appointment.id, "Cancelada")}
                className="rounded-full border border-red-200 px-3 py-2 text-xs text-red-700"
              >
                <XCircle size={14} className="inline" /> Cancelar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
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

function Panel({
  title,
  children,
  dark = false,
}: {
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={
        dark
          ? "rounded-[2rem] bg-neutral-950 p-6 text-white shadow-sm"
          : "rounded-[2rem] bg-white p-6 shadow-sm"
      }
    >
      <h3 className="mb-5 text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-full border px-3 py-1 text-sm">
            Cerrar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
