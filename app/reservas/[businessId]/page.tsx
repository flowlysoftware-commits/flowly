"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
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

type BookingSettings = {
  start_time: string;
  end_time: string;
  interval_minutes: number;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
};

const defaultSettings: BookingSettings = {
  start_time: "09:00",
  end_time: "19:00",
  interval_minutes: 30,
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
};

export default function PublicBookingPage() {
  const params = useParams();
  const businessId = params.businessId as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [settings, setSettings] = useState<BookingSettings>(defaultSettings);

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
    if (!businessId) return;
    
    const load = async () => {
      const {
  data: businessData,
  error: businessError,
} = await supabase
  .from("businesses")
  .select("id, name, business_type")
  .eq("id", businessId)
  .single();

console.log("BUSINESS ID:", businessId);
console.log("BUSINESS DATA:", businessData);
console.log("BUSINESS ERROR:", businessError);

if (businessError) {
  alert(JSON.stringify(businessError));
  return;
}

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

      const { data: settingsData } = await supabase
        .from("booking_settings")
        .select("*")
        .eq("business_id", businessId)
        .maybeSingle();

      if (settingsData) {
        setSettings(settingsData);
      }
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

  const generatedHours = useMemo(() => {
    return generateHours(
      settings.start_time,
      settings.end_time,
      settings.interval_minutes
    );
  }, [settings.start_time, settings.end_time, settings.interval_minutes]);

  const selectedDateIsOpen = useMemo(() => {
    if (!date) return true;

    const day = new Date(`${date}T12:00:00`).getDay();

    if (day === 0) return settings.sunday;
    if (day === 1) return settings.monday;
    if (day === 2) return settings.tuesday;
    if (day === 3) return settings.wednesday;
    if (day === 4) return settings.thursday;
    if (day === 5) return settings.friday;
    if (day === 6) return settings.saturday;

    return true;
  }, [date, settings]);

  const busyHours = useMemo(() => {
    return appointments.map((appointment) => {
      const value = new Date(appointment.appointment_date);
      return value.toTimeString().slice(0, 5);
    });
  }, [appointments]);

  const freeHours = generatedHours.filter((hour) => !busyHours.includes(hour));

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

    if (!selectedDateIsOpen) {
      alert("El negocio no acepta reservas este día.");
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
    <main className="flex min-h-screen items-center justify-center flowly-app-shell px-6 text-center text-white">
      <div>
        <h1 className="text-2xl font-semibold">No se pudo cargar la página de reservas</h1>
        <p className="mt-3 text-white/60">
          Revisa que el enlace sea correcto y que las reservas públicas estén activadas.
        </p>
      </div>
    </main>
  );
}

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center flowly-app-shell px-6 text-white">
        <div className="flowly-app-content flowly-app-panel w-full max-w-md rounded-[2rem] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600">
            <CheckCircle2 size={32} />
          </div>

          <h1 className="mt-6 text-3xl font-semibold">Reserva solicitada</h1>

          <p className="mt-3 text-white/60">
            Hemos recibido tu reserva. El negocio podrá confirmarla desde su
            panel.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flowly-app-shell px-6 py-10 text-white">
      <div className="flowly-app-content mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
            <CalendarDays size={32} />
          </div>

          <p className="text-sm font-medium text-cyan-200">
            Reservas online
          </p>

          <h1 className="mt-3 text-4xl font-semibold">{business.name}</h1>

          <p className="mt-3 text-white/60">{business.business_type}</p>
        </header>

        <section className="flowly-app-panel rounded-[2rem] p-6">
          <div className="grid gap-5">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="input-dark"
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
              className="input-dark"
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
              className="input-dark"
            />

            {date && !selectedDateIsOpen && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Este negocio no acepta reservas este día. Elige otro día.
              </div>
            )}

            {date && selectedEmployee && selectedDateIsOpen && (
              <div>
                <p className="mb-3 text-sm font-medium text-white/70">
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
                          : "rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white/70 hover:bg-white/10"
                      }
                    >
                      {hour}
                    </button>
                  ))}
                </div>

                {freeHours.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/45">
                    No quedan horas disponibles para este profesional en este día.
                  </div>
                )}
              </div>
            )}

            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Tu nombre"
              className="input-dark"
            />

            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Tu teléfono"
              className="input-dark"
            />

            <input
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Tu email opcional"
              type="email"
              className="input-dark"
            />

            <button
              onClick={createBooking}
              disabled={loading}
              className="rounded-full bg-gradient-to-r from-cyan-300 to-violet-300 px-6 py-4 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 disabled:opacity-60"
            >
              {loading ? "Creando reserva..." : "Solicitar reserva"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function generateHours(startTime: string, endTime: string, interval: number) {
  const result: string[] = [];

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  for (let current = start; current < end; current += interval) {
    const hour = Math.floor(current / 60);
    const minute = current % 60;

    result.push(
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
    );
  }

  return result;
}
