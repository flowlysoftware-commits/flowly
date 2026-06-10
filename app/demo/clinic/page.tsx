"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Euro,
  FileText,
  HeartPulse,
  LogOut,
  Plus,
  Stethoscope,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

type Tab = "Dashboard" | "Agenda" | "Pacientes" | "Tratamientos" | "Facturación";
type AppointmentStatus = "Pendiente" | "Confirmada" | "Cancelada";

type Appointment = {
  id: number;
  patient: string;
  treatment: string;
  time: string;
  specialist: string;
  status: AppointmentStatus;
  price: number;
};

type Patient = {
  id: number;
  name: string;
  phone: string;
  condition: string;
  sessions: number;
  progress: string;
  nextAppointment: string;
  notes: string;
};

type Treatment = {
  id: number;
  name: string;
  duration: string;
  price: number;
  active: boolean;
};

const initialAppointments: Appointment[] = [
  { id: 1, patient: "Juan Pérez", treatment: "Fisioterapia lumbar", time: "09:00", specialist: "Ricky", status: "Confirmada", price: 45 },
  { id: 2, patient: "María López", treatment: "Masaje deportivo", time: "10:30", specialist: "Laura", status: "Pendiente", price: 50 },
  { id: 3, patient: "Pedro García", treatment: "Osteopatía", time: "12:00", specialist: "Ricky", status: "Confirmada", price: 60 },
];

const initialPatients: Patient[] = [
  {
    id: 1,
    name: "Juan Pérez",
    phone: "611 222 333",
    condition: "Dolor lumbar",
    sessions: 4,
    progress: "70%",
    nextAppointment: "Hoy · 09:00",
    notes: "Movilidad mejorada. Mantener ejercicios en casa.",
  },
  {
    id: 2,
    name: "María López",
    phone: "622 444 555",
    condition: "Sobrecarga muscular",
    sessions: 2,
    progress: "45%",
    nextAppointment: "Hoy · 10:30",
    notes: "Pendiente valorar evolución tras segunda sesión.",
  },
  {
    id: 3,
    name: "Pedro García",
    phone: "633 777 888",
    condition: "Cervicalgia",
    sessions: 6,
    progress: "85%",
    nextAppointment: "Hoy · 12:00",
    notes: "Buen progreso. Reducir frecuencia a una sesión semanal.",
  },
];

const initialTreatments: Treatment[] = [
  { id: 1, name: "Fisioterapia", duration: "45 min", price: 45, active: true },
  { id: 2, name: "Osteopatía", duration: "60 min", price: 60, active: true },
  { id: 3, name: "Masaje deportivo", duration: "50 min", price: 50, active: true },
  { id: 4, name: "Punción seca", duration: "35 min", price: 40, active: true },
];

export default function ClinicDemoPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [treatments, setTreatments] = useState<Treatment[]>(initialTreatments);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatients[0]);
  const [openPatient, setOpenPatient] = useState(false);
  const [openAppointment, setOpenAppointment] = useState(false);
  const [toast, setToast] = useState("");

  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [condition, setCondition] = useState("");

  const [appointmentPatient, setAppointmentPatient] = useState("");
  const [appointmentTreatment, setAppointmentTreatment] = useState("Fisioterapia");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentPrice, setAppointmentPrice] = useState("45");

  useEffect(() => {
    const access = localStorage.getItem("flowly_demo_access");
    if (access !== "true") router.push("/demo/login");
  }, [router]);

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  const logout = () => {
    localStorage.removeItem("flowly_demo_access");
    router.push("/");
  };

  const activeAppointments = appointments.filter((a) => a.status !== "Cancelada");
  const monthlyRevenue = 9200 + appointments.reduce((sum, a) => sum + a.price, 0);
  const activeTreatments = treatments.filter((t) => t.active).length;

  const updateAppointmentStatus = (id: number, status: AppointmentStatus) => {
    setAppointments((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
    notify(`Cita marcada como ${status.toLowerCase()}`);
  };

  const createPatient = () => {
    if (!patientName || !patientPhone || !condition) return alert("Faltan datos");

    const patient: Patient = {
      id: Date.now(),
      name: patientName,
      phone: patientPhone,
      condition,
      sessions: 0,
      progress: "0%",
      nextAppointment: "Sin cita",
      notes: "Paciente creado desde demo.",
    };

    setPatients([patient, ...patients]);
    setSelectedPatient(patient);
    setPatientName("");
    setPatientPhone("");
    setCondition("");
    setOpenPatient(false);
    notify("Paciente creado correctamente");
  };

  const createAppointment = () => {
    if (!appointmentPatient || !appointmentTime) return alert("Faltan datos");

    const appointment: Appointment = {
      id: Date.now(),
      patient: appointmentPatient,
      treatment: appointmentTreatment,
      time: appointmentTime,
      specialist: "Ricky",
      status: "Pendiente",
      price: Number(appointmentPrice),
    };

    setAppointments([appointment, ...appointments]);
    setAppointmentPatient("");
    setAppointmentTime("");
    setOpenAppointment(false);
    notify("Cita creada correctamente");
  };

  const toggleTreatment = (id: number) => {
    setTreatments((current) =>
      current.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
    notify("Tratamiento actualizado");
  };

  return (
    <main className="flowly-demo-shell min-h-screen">
      {toast && (
        <div className="fixed right-6 top-6 z-[60] rounded-full bg-neutral-950 px-5 py-3 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}

      <div className="flex min-h-screen">
        <aside className="flowly-demo-sidebar hidden w-72 p-6 md:block">
          <h1 className="text-xl font-semibold text-white">Flowly Clinic</h1>
          <p className="mt-1 text-sm text-white/45">Clínicas y fisioterapia</p>

          <nav className="mt-10 space-y-2 text-sm">
            {[
              ["Dashboard", HeartPulse],
              ["Agenda", CalendarDays],
              ["Pacientes", Users],
              ["Tratamientos", Stethoscope],
              ["Facturación", Euro],
            ].map(([label, Icon]) => (
              <button
                key={String(label)}
                onClick={() => setActiveTab(label as Tab)}
                className={
                  activeTab === label
                    ? "flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-950/30"
                    : "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-white/62 hover:bg-white/10 hover:text-white"
                }
              >
                <Icon size={18} />
                {label as string}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex-1 px-6 py-8 text-white">
          <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-cyan-200">Demo · Clínica</p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight">Flowly Clinic Fisioterapia</h2>
              <p className="mt-2 text-white/58">
                Gestiona pacientes, citas, tratamientos, historial y facturación.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setOpenAppointment(true)} className="flowly-primary rounded-full px-5 py-3 font-semibold">
                <Plus size={18} className="inline" /> Nueva cita
              </button>
              <button onClick={logout} className="flowly-secondary rounded-full px-5 py-3 text-white">
                <LogOut size={18} className="inline" /> Salir
              </button>
            </div>
          </header>

          <div className="mb-6 flex gap-2 overflow-x-auto md:hidden">
            {["Dashboard", "Agenda", "Pacientes", "Tratamientos", "Facturación"].map((tab) => (
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
                <Card icon={<Users />} label="Pacientes activos" value={patients.length} />
                <Card icon={<CalendarDays />} label="Citas hoy" value={activeAppointments.length} />
                <Card icon={<Euro />} label="Facturación mensual" value={`${monthlyRevenue} €`} />
                <Card icon={<Activity />} label="Tratamientos activos" value={activeTreatments} />
              </section>

              <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <Panel title="Agenda de hoy">
                  <AppointmentList appointments={appointments} updateAppointmentStatus={updateAppointmentStatus} />
                </Panel>

                <Panel dark title="Resumen clínico">
                  <div className="space-y-3 text-sm text-white/75">
                    <div className="rounded-2xl bg-white/10 p-4">
                      {activeAppointments.length} citas programadas para hoy.
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      {patients[0].name} muestra una evolución del {patients[0].progress}.
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      Tratamiento más demandado: fisioterapia.
                    </div>
                  </div>
                </Panel>
              </section>
            </>
          )}

          {activeTab === "Agenda" && (
            <Panel title="Agenda clínica">
              <div className="mb-5 flex justify-between">
                <p className="text-sm text-neutral-500">Gestiona citas y confirmaciones.</p>
                <button onClick={() => setOpenAppointment(true)} className="flowly-primary rounded-full px-4 py-2 text-sm font-semibold">
                  + Nueva cita
                </button>
              </div>
              <AppointmentList appointments={appointments} updateAppointmentStatus={updateAppointmentStatus} />
            </Panel>
          )}

          {activeTab === "Pacientes" && (
            <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <Panel title="Pacientes">
                <div className="mb-5 flex justify-between">
                  <p className="text-sm text-neutral-500">Listado y ficha clínica.</p>
                  <button onClick={() => setOpenPatient(true)} className="flowly-primary rounded-full px-4 py-2 text-sm font-semibold">
                    <UserPlus size={16} className="inline" /> Nuevo paciente
                  </button>
                </div>

                <div className="space-y-3">
                  {patients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className="w-full rounded-2xl border border-neutral-100 p-4 text-left hover:bg-neutral-50"
                    >
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-neutral-500">{patient.condition} · {patient.phone}</p>
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel title="Ficha clínica">
                {selectedPatient && (
                  <div>
                    <h3 className="text-2xl font-semibold">{selectedPatient.name}</h3>
                    <p className="mt-2 text-neutral-500">{selectedPatient.condition}</p>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <MiniCard label="Sesiones" value={selectedPatient.sessions} />
                      <MiniCard label="Evolución" value={selectedPatient.progress} />
                      <MiniCard label="Próxima cita" value={selectedPatient.nextAppointment} />
                      <MiniCard label="Teléfono" value={selectedPatient.phone} />
                    </div>

                    <div className="mt-6 rounded-3xl bg-neutral-50 p-5">
                      <p className="mb-2 text-sm font-medium">Notas clínicas</p>
                      <p className="text-sm leading-6 text-neutral-600">{selectedPatient.notes}</p>
                    </div>
                  </div>
                )}
              </Panel>
            </section>
          )}

          {activeTab === "Tratamientos" && (
            <Panel title="Tratamientos">
              <div className="grid gap-4 md:grid-cols-2">
                {treatments.map((treatment) => (
                  <div key={treatment.id} className="rounded-3xl border border-neutral-100 p-5">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{treatment.name}</h3>
                        <p className="mt-1 text-sm text-white/45">{treatment.duration}</p>
                      </div>
                      <p className="text-xl font-semibold">{treatment.price} €</p>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <span className={treatment.active ? "rounded-full bg-green-50 px-3 py-1 text-xs text-green-700" : "rounded-full bg-red-50 px-3 py-1 text-xs text-red-700"}>
                        {treatment.active ? "Activo" : "Inactivo"}
                      </span>

                      <button onClick={() => toggleTreatment(treatment.id)} className="rounded-full border px-4 py-2 text-xs">
                        {treatment.active ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {activeTab === "Facturación" && (
            <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <Panel title="Facturación mensual">
                <div className="flex h-72 items-end gap-3">
                  {[42, 55, 60, 78, 70, 92].map((value, index) => (
                    <div key={index} className="flex flex-1 flex-col items-center gap-3">
                      <div className="w-full rounded-t-2xl bg-gradient-to-t from-violet-600 to-pink-300" style={{ height: `${value}%` }} />
                      <p className="text-xs text-neutral-500">{["Ene", "Feb", "Mar", "Abr", "May", "Jun"][index]}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Conceptos destacados">
                <div className="space-y-3">
                  {treatments.map((treatment, index) => (
                    <div key={treatment.id} className="rounded-2xl bg-neutral-50 p-4">
                      <p className="font-medium">#{index + 1} {treatment.name}</p>
                      <p className="mt-1 text-sm text-white/45">Ticket: {treatment.price} €</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>
          )}
        </section>
      </div>

      {openPatient && (
        <Modal title="Nuevo paciente" onClose={() => setOpenPatient(false)}>
          <div className="grid gap-4">
            <input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Nombre" className="rounded-2xl border px-4 py-3" />
            <input value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} placeholder="Teléfono" className="rounded-2xl border px-4 py-3" />
            <input value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="Motivo / lesión" className="rounded-2xl border px-4 py-3" />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setOpenPatient(false)} className="rounded-full border px-5 py-3">Cancelar</button>
            <button onClick={createPatient} className="flowly-primary rounded-full px-5 py-3 font-semibold">Crear paciente</button>
          </div>
        </Modal>
      )}

      {openAppointment && (
        <Modal title="Nueva cita" onClose={() => setOpenAppointment(false)}>
          <div className="grid gap-4">
            <input value={appointmentPatient} onChange={(e) => setAppointmentPatient(e.target.value)} placeholder="Paciente" className="rounded-2xl border px-4 py-3" />
            <select value={appointmentTreatment} onChange={(e) => setAppointmentTreatment(e.target.value)} className="rounded-2xl border px-4 py-3">
              {treatments.filter((t) => t.active).map((t) => <option key={t.id}>{t.name}</option>)}
            </select>
            <input value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} placeholder="Hora, ejemplo 16:30" className="rounded-2xl border px-4 py-3" />
            <input value={appointmentPrice} onChange={(e) => setAppointmentPrice(e.target.value)} placeholder="Precio" type="number" className="rounded-2xl border px-4 py-3" />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setOpenAppointment(false)} className="rounded-full border px-5 py-3">Cancelar</button>
            <button onClick={createAppointment} className="flowly-primary rounded-full px-5 py-3 font-semibold">Crear cita</button>
          </div>
        </Modal>
      )}
    </main>
  );
}

function AppointmentList({
  appointments,
  updateAppointmentStatus,
}: {
  appointments: Appointment[];
  updateAppointmentStatus: (id: number, status: AppointmentStatus) => void;
}) {
  return (
    <div className="space-y-3">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-neutral-100 p-4 md:flex-row md:items-center">
          <div>
            <p className="font-medium">{appointment.patient}</p>
            <p className="text-sm text-neutral-500">
              {appointment.treatment} · {appointment.specialist} · {appointment.time}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs">{appointment.status}</span>
            <strong>{appointment.price} €</strong>

            {appointment.status !== "Confirmada" && (
              <button onClick={() => updateAppointmentStatus(appointment.id, "Confirmada")} className="rounded-full border border-green-200 px-3 py-2 text-xs text-green-700">
                <CheckCircle2 size={14} className="inline" /> Confirmar
              </button>
            )}

            {appointment.status !== "Cancelada" && (
              <button onClick={() => updateAppointmentStatus(appointment.id, "Cancelada")} className="rounded-full border border-red-200 px-3 py-2 text-xs text-red-700">
                <XCircle size={14} className="inline" /> Cancelar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
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

function MiniCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-neutral-50 p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function Panel({ title, children, dark = false }: { title: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={dark ? "rounded-[2rem] bg-neutral-950 p-6 text-white shadow-sm" : "rounded-[2rem] bg-white p-6 shadow-sm"}>
      <h3 className="mb-5 text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-full border px-3 py-1 text-sm">Cerrar</button>
        </div>
        {children}
      </div>
    </div>
  );
}
