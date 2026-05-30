"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CalendarDays, CheckCircle2 } from "lucide-react";

type Business = {
  id: string;
  name: string;
  business_type: string;
};

type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
};

type Employee = {
  id: string;
  name: string;
  active: boolean;
};

type Appointment = {
  id: string;
  appointment_date: string;
  employee_id: string | null;
  status: string;
};

const availableHours = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
];

export default function PublicBookingPage({
  params,
}: {
  params: { businessId: string };
}) {
  const businessId = params.businessId;

  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [selectedService, setSelectedService] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: businessData } = await supabase
        .from("businesses")
        .select("id, name, business_type")
        .eq("id", businessId)
        .single();

      setBusiness(businessData);

      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", businessId)
        .eq("active", true)
        .order("name");

      setServices(servicesData || []);

      const { data: employeesData } = await supabase
        .from("employees")
        .select("id, name, active")
        .eq("business_id", businessId)
        .eq("active", true)
        .order("name");

      setEmployees(employeesData || []);
    };

    load();
  }, [businessId]);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!date || !selectedEmployee) {
        setAppointments([]);
        return;
      }

      const start = `${date}T00:00:00`;
      const end = `${date}T23:59:59`;

      const { data } = await supabase
        .from("appointments")
        .select("id, appointment_date, employee_id, status")
        .eq("business_id", businessId)
        .eq("employee_id", selectedEmployee)
        .gte("appointment_date", start)
        .lte("appointment_date", end)
        .in("status", ["pending", "confirmed"]);

      setAppointments(data || []);
    };

    loadAppointments();
  }, [businessId, date, selectedEmployee]);

  const busyHours = useMemo(() => {
    return appointments.map((appointment) => {
      const value = new Date(appointment.appointment_date);
      return value.toTimeString().slice(0, 5);
    });
  }, [appointments]);

  const freeHours = availableHours.filter((hour) => !busyHours.includes(hour));

  const createBooking = async () => {
    if (
      !selectedService ||
      !selectedEmployee ||
      !date ||
      !time ||
      !customerName ||
      !customerPhone
    ) {
      alert("Rellena servicio, empleado, fecha, hora, nombre y teléfono");
      return;
    }

    setLoading(true);

    const appointmentDate = `${date}T${time}:00`;

    const { data: existingAppointment } = await supabase
      .from("appointments")
      .select("id")
      .eq("business_id", businessId)
      .eq("employee_id", selectedEmployee)
      .eq("appointment_date", appointmentDate)
      .in("status", ["pending", "confirmed"])
      .maybeSingle();

    if (existingAppointment) {
      alert("Esta hora ya no está disponible. Elige otra.");
      setLoading(false);
      return;
    }

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        business_id: businessId,
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
      })
      .select()
      .single();

    if (customerError) {
      alert(customerError.message);
      setLoading(false);
      return;
    }

    const { error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        business_id: businessId,
        customer_id: customer.id,
        employee_id: selectedEmployee,
        service_id: selectedService,
        appointment_date: appointmentDate,
        status: "pending",
      });

    if (appointmentError) {
      alert(appointmentError.message);
    } else {
      setDone(true);
    }

    setLoading(false);
  };

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7fb]">
        Cargando reservas...
      </main>
    );
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#f3e8ff_0%,#ffffff_35%,#f8fafc_100%)] px-6">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600">
            <CheckCircle2 size={32} />
          </div>

          <h1 className="mt-6 text-3xl font-semibold">Reserva solicitada</h1>

          <p className="mt-3 text-neutral-600">
            Hemos recibido tu reserva. El negocio podrá confirmarla desde su
            panel.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f3e8ff_0%,#ffffff_35%,#f8fafc_100%)] px-6 py-10 text-neutral-950">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <CalendarDays size={32} />
          </div>

          <p className="text-sm font-medium text-violet-600">
            Reservas online
          </p>

          <h1 className="mt-3 text-4xl font-semibold">{business.name}</h1>

          <p className="mt-3 text-neutral-600">{business.business_type}</p>
        </header>

        <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-violet-100">
          <div className="grid gap-5">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="rounded-2xl border px-4 py-3"
            >
              <option value="">Selecciona servicio</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} · {service.duration} min · {service.price}€
                </option>
              ))}
            </select>

            <select
              value={selectedEmployee}
              onChange={(e) => {
                setSelectedEmployee(e.target.value);
                setTime("");
              }}
              className="rounded-2xl border px-4 py-3"
            >
              <option value="">Selecciona profesional</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setTime("");
              }}
              className="rounded-2xl border px-4 py-3"
            />

            {date && selectedEmployee && (
              <div>
                <p className="mb-3 text-sm font-medium text-neutral-700">
                  Horas disponibles
                </p>

                <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                  {freeHours.map((hour) => (
                    <button
                      key={hour}
                      onClick={() => setTime(hour)}
                      className={
                        time === hour
                          ? "rounded-2xl bg-neutral-950 px-4 py-3 text-sm text-white"
                          : "rounded-2xl border border-neutral-200 px-4 py-3 text-sm hover:bg-neutral-50"
                      }
                    >
                      {hour}
                    </button>
                  ))}
                </div>

                {freeHours.length === 0 && (
                  <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-neutral-500">
                    No quedan horas disponibles para este profesional en este día.
                  </div>
                )}
              </div>
            )}

            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Tu nombre"
              className="rounded-2xl border px-4 py-3"
            />

            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Tu teléfono"
              className="rounded-2xl border px-4 py-3"
            />

            <input
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Tu email opcional"
              type="email"
              className="rounded-2xl border px-4 py-3"
            />

            <button
              onClick={createBooking}
              disabled={loading}
              className="rounded-full bg-neutral-950 px-6 py-4 text-white disabled:opacity-60"
            >
              {loading ? "Creando reserva..." : "Solicitar reserva"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
