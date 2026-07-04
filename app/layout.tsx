import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import FlowlyCompanionGate from "@/components/FlowlyCompanionGate";
import FlowlyAnalyticsTracker from "@/components/FlowlyAnalyticsTracker";

export const metadata: Metadata = {
  title: "Flowly IA | La IA que organiza tu empresa",
  description: "Flowly organiza clientes, WhatsApp, agenda, presupuestos, facturas y seguimiento para que tu negocio venda más con menos caos.",
};

const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1479231557294191";

const metaPixelCode = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');
`;

const googleAnalyticsId = "G-LEVMGKR303";

const googleTagCode = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAnalyticsId}');
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <Script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} />
        <Script id="google-analytics" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: googleTagCode }} />
        <Script id="meta-pixel" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: metaPixelCode }} />
      </head>
      <body>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        {children}
        <FlowlyAnalyticsTracker />
        <FlowlyCompanionGate />
      </body>
    </html>
  );
}
