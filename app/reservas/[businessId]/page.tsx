"use client";

import { useEffect, useState } from "react";
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

export default function PublicBookingPage({
  params,
}: {
  params: { businessId: string };
}) {
  const businessId = params.businessId;

  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState("");
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
    };

    load();
  }, [businessId]);

  const createBooking = async () => {
    if (!selectedService || !date || !time || !customerName || !customerPhone) {
      alert("Rellena servicio, fecha, hora, nombre y teléfono");
      return;
    }

    setLoading(true);

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

    const appointmentDate = `${date}T${time}:00`;

    const { error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        business_id: businessId,
        customer_id: customer.id,
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

            <div className="grid gap-5 md:grid-cols-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-2xl border px-4 py-3"
              />

              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-2xl border px-4 py-3"
              />
            </div>

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
