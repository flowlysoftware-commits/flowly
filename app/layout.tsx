import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import FlowCompanion from "@/components/flow-companion/FlowCompanion";
import FlowPanelIntegrationLayer from "@/components/FlowPanelIntegrationLayer";
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

const flowlyEarlyAnalyticsCode = `
(function(){
  try {
    var path = window.location.pathname || "/";
    if (path.indexOf("/paneladmin") === 0 || path.indexOf("/contabilidad") === 0 || path.indexOf("/api") === 0) return;
    var params = new URLSearchParams(window.location.search || "");
    function id(prefix){
      if (window.crypto && crypto.randomUUID) return prefix + "_" + crypto.randomUUID();
      return prefix + "_" + Date.now() + "_" + Math.random().toString(16).slice(2);
    }
    var visitorKey = "flowly_analytics_visitor_id";
    var sessionKey = "flowly_analytics_session_id";
    var startedKey = "flowly_analytics_session_started_at";
    var visitorId = localStorage.getItem(visitorKey) || id("visitor");
    localStorage.setItem(visitorKey, visitorId);
    var startedAt = Number(sessionStorage.getItem(startedKey) || 0);
    var sessionId = sessionStorage.getItem(sessionKey);
    if (!sessionId || !startedAt || Date.now() - startedAt > 30 * 60 * 1000) {
      sessionId = id("session");
      sessionStorage.setItem(sessionKey, sessionId);
    }
    sessionStorage.setItem(startedKey, String(Date.now()));
    var q = new URLSearchParams();
    q.set("event", "page_load");
    q.set("visitorId", visitorId);
    q.set("sessionId", sessionId);
    q.set("path", path);
    q.set("fullPath", path + (window.location.search || "") + (window.location.hash || ""));
    q.set("referrer", document.referrer || "");
    q.set("viewport", window.innerWidth + "x" + window.innerHeight);
    q.set("language", navigator.language || "");
    q.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone || "");
    ["gclid","fbclid","utm_source","utm_medium","utm_campaign","utm_content","utm_term"].forEach(function(key){
      var value = params.get(key);
      if (value) q.set(key, value);
    });
    (new Image()).src = "/api/analytics/track?" + q.toString();
  } catch (error) {}
})();
`;


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
        <Script id="flowly-early-analytics" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: flowlyEarlyAnalyticsCode }} />
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
        <FlowPanelIntegrationLayer />
        <FlowCompanion />
      </body>
    </html>
  );
}
