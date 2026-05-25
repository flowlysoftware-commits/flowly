import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flowly IA | SaaS para negocios modernos",
  description: "Automatiza reservas, clientes, pagos y dashboards con Flowly IA.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
