import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import FlowlyCompanionRuntime from "@/components/FlowlyCompanionRuntime";

export const metadata: Metadata = {
  title: "Flowly IA | SaaS para negocios modernos",
  description: "Automatiza reservas, clientes, pagos y dashboards con Flowly IA.",
};

const metaPixelCode = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1494265335773412');
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
            src="https://www.facebook.com/tr?id=1494265335773412&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {children}
        <FlowlyCompanionRuntime />
      </body>
    </html>
  );
}
