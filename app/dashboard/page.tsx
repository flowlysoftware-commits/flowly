"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Users,
  Scissors,
  UserRound,
  Plus,
  LogOut,
} from "lucide-react";

type Business = {
  id: string;
  name: string;
  business_type: string;
  plan: string;
  subscription_status: string;
};

type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
  active: boolean;
};

type Employee = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  active: boolean;
};

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
};

type Appointment = {
  id: string;
  appointment_date: string;
  status: string;
  customers: { name: string } | null;
  employees: { name: string } | null;
  services: { name: string; price: number } | null;
};

type Tab = "Agenda" | "Servicios" | "Empleados" | "Clientes";

export default function DashboardPage() {
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("Agenda");

  const [serviceName, setServiceName] = useState("");
  const [serviceDuration, setServiceDuration] = useState("30");
  const [servicePrice, setServicePrice] = useState("");

  const [employeeName, setEmployeeName] = useState("");
  const [employeePhone, setEmployeePhone] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [appointmentCustomer, setAppointmentCustomer] = useState("");
  const [appointmentEmployee, setAppointmentEmployee] = useState("");
  const [appointmentService, setAppointmentService] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");

  const loadData = async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      router.push("/login");
      return;
    }

    const { data: businessData } = await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", userData.user.id)
      .single();

    if (!businessData) return;

    setBusiness(businessData);

    const businessId = businessData.id;

    const [{ data: servicesData }, { data: employeesData }, { data: customersData }, { data: appointmentsData }] =
      await Promise.all([
        supabase.from("services").select("*").eq("business_id", businessId).order("created_at"),
        supabase.from("employees").select("*").eq("business_id", businessId).order("created_at"),
        supabase.from("customers").select("*").eq("business_id", businessId).order("created_at"),
        supabase
          .from("appointments")
          .select("*, customers(name), employees(name), services(name, price)")
          .eq("business_id", businessId)
          .order("appointment_date"),
      ]);

    setServices(servicesData || []);
    setEmployees(employeesData || []);
    setCustomers(customersData || []);
    setAppointments(appointmentsData || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const createService = async () => {
    if (!business || !serviceName || !servicePrice) return alert("Faltan datos");

    await supabase.from("services").insert({
      business_id: business.id,
      name: serviceName,
      duration: Number(serviceDuration),
      price: Number(servicePrice),
    });

    setServiceName("");
    setServicePrice("");
    await loadData();
  };

  const createEmployee = async () => {
    if (!business || !employeeName) return alert("Faltan datos");

    await supabase.from("employees").insert({
      business_id: business.id,
      name: employeeName,
      phone: employeePhone,
    });

    setEmployeeName("");
    setEmployeePhone("");
    await loadData();
  };

  const createCustomer = async () => {
    if (!business || !customerName) return alert("Faltan datos");

    await supabase.from("customers").insert({
      business_id: business.id,
      name: customerName,
      phone: customerPhone,
    });

    setCustomerName("");
    setCustomerPhone("");
    await loadData();
  };

  const createAppointment = async () => {
    if (
      !business ||
      !appointmentCustomer ||
      !appointmentEmployee ||
      !appointmentService ||
      !appointmentDate
    ) {
      return alert("Faltan datos");
    }

    await supabase.from("appointments").insert({
      business_id: business.id,
      customer_id: appointmentCustomer,
      employee_id: appointmentEmployee,
      service_id: appointmentService,
      appointment_date: appointmentDate,
      status: "confirmed",
    });

    setAppointmentCustomer("");
    setAppointmentEmployee("");
    setAppointmentService("");
    setAppointmentDate("");
    await loadData();
  };

  const revenue = appointments.reduce(
    (sum, item) => sum + Number(item.services?.price || 0),
    0
  );

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7fb]">
        Cargando panel...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7fb] px-6 py-8 text-neutral-950">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
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
            className="rounded-full border bg-white px-5 py-3"
          >
            <LogOut size={18} className="inline" /> Salir
          </button>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <Card icon={<CalendarDays />} label="Reservas" value={appointments.length} />
          <Card icon={<Users />} label="Clientes" value={customers.length} />
          <Card icon={<Scissors />} label="Servicios" value={services.length} />
          <Card icon={<UserRound />} label="Ingresos previstos" value={`${revenue.toFixed(2)}€`} />
        </section>

        <section className="mb-6 flex flex-wrap gap-3">
          {["Agenda", "Servicios", "Empleados", "Clientes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={
                activeTab === tab
                  ? "rounded-full bg-neutral-950 px-5 py-3 text-sm text-white"
                  : "rounded-full border bg-white px-5 py-3 text-sm text-neutral-600"
              }
            >
              {tab}
            </button>
          ))}
        </section>

        {activeTab === "Agenda" && (
          <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Nueva reserva">
              <div className="grid gap-4">
                <select
                  value={appointmentCustomer}
                  onChange={(e) => setAppointmentCustomer(e.target.value)}
                  className="rounded-2xl border px-4 py-3"
                >
                  <option value="">Seleccionar cliente</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>

                <select
                  value={appointmentEmployee}
                  onChange={(e) => setAppointmentEmployee(e.target.value)}
                  className="rounded-2xl border px-4 py-3"
                >
                  <option value="">Seleccionar empleado</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>

                <select
                  value={appointmentService}
                  onChange={(e) => setAppointmentService(e.target.value)}
                  className="rounded-2xl border px-4 py-3"
                >
                  <option value="">Seleccionar servicio</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} · {service.price}€
                    </option>
                  ))}
                </select>

                <input
                  type="datetime-local"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="rounded-2xl border px-4 py-3"
                />

                <button
                  onClick={createAppointment}
                  className="rounded-full bg-neutral-950 px-5 py-3 text-white"
                >
                  <Plus size={18} className="inline" /> Crear reserva
                </button>
              </div>
            </Panel>

            <Panel title="Calendario visual">
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4"
                  >
                    <p className="font-semibold">
                      {new Date(appointment.appointment_date).toLocaleString("es-ES")}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      {appointment.customers?.name} · {appointment.services?.name} ·{" "}
                      {appointment.employees?.name}
                    </p>
                    <p className="mt-1 text-sm font-medium text-violet-600">
                      {appointment.services?.price || 0}€
                    </p>
                  </div>
                ))}

                {appointments.length === 0 && (
                  <div className="rounded-2xl border border-dashed p-8 text-center text-neutral-500">
                    Todavía no hay reservas.
                  </div>
                )}
              </div>
            </Panel>
          </section>
        )}

        {activeTab === "Servicios" && (
          <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Nuevo servicio">
              <div className="grid gap-4">
                <input
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Nombre del servicio"
                  className="rounded-2xl border px-4 py-3"
                />

                <input
                  value={serviceDuration}
                  onChange={(e) => setServiceDuration(e.target.value)}
                  placeholder="Duración en minutos"
                  type="number"
                  className="rounded-2xl border px-4 py-3"
                />

                <input
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value)}
                  placeholder="Precio"
                  type="number"
                  className="rounded-2xl border px-4 py-3"
                />

                <button
                  onClick={createService}
                  className="rounded-full bg-neutral-950 px-5 py-3 text-white"
                >
                  Crear servicio
                </button>
              </div>
            </Panel>

            <Panel title="Servicios creados">
              <div className="grid gap-4 md:grid-cols-2">
                {services.map((service) => (
                  <div key={service.id} className="rounded-3xl border p-5">
                    <h3 className="text-lg font-semibold">{service.name}</h3>
                    <p className="mt-2 text-sm text-neutral-500">
                      {service.duration} min
                    </p>
                    <p className="mt-4 text-2xl font-semibold">
                      {Number(service.price).toFixed(2)}€
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        )}

        {activeTab === "Empleados" && (
          <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Nuevo empleado">
              <div className="grid gap-4">
                <input
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="Nombre"
                  className="rounded-2xl border px-4 py-3"
                />

                <input
                  value={employeePhone}
                  onChange={(e) => setEmployeePhone(e.target.value)}
                  placeholder="Teléfono"
                  className="rounded-2xl border px-4 py-3"
                />

                <button
                  onClick={createEmployee}
                  className="rounded-full bg-neutral-950 px-5 py-3 text-white"
                >
                  Crear empleado
                </button>
              </div>
            </Panel>

            <Panel title="Empleados">
              <div className="space-y-3">
                {employees.map((employee) => (
                  <div key={employee.id} className="rounded-2xl border p-4">
                    <p className="font-semibold">{employee.name}</p>
                    <p className="text-sm text-neutral-500">
                      {employee.phone || "Sin teléfono"}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        )}

        {activeTab === "Clientes" && (
          <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Nuevo cliente">
              <div className="grid gap-4">
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre"
                  className="rounded-2xl border px-4 py-3"
                />

                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Teléfono"
                  className="rounded-2xl border px-4 py-3"
                />

                <button
                  onClick={createCustomer}
                  className="rounded-full bg-neutral-950 px-5 py-3 text-white"
                >
                  Crear cliente
                </button>
              </div>
            </Panel>

            <Panel title="Clientes">
              <div className="space-y-3">
                {customers.map((customer) => (
                  <div key={customer.id} className="rounded-2xl border p-4">
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-sm text-neutral-500">
                      {customer.phone || "Sin teléfono"}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        )}
      </div>
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

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}
