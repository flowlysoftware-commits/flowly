"use client";

import { PhoneCall } from "lucide-react";

export default function VoiceModule() {
  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6">

        <div className="flex items-center gap-3 mb-4">
          <PhoneCall />
          <h2 className="text-2xl font-semibold">
            Flowly Voice
          </h2>
        </div>

        <p className="text-white/60">
          Centro de gestión de llamadas.
        </p>

      </div>
    </section>
  );
}
