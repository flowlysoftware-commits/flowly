"use client";

import { supabase } from "@/lib/supabaseClient";

export async function accountingFetch(input: string, init: RequestInit = {}) {
  const url = new URL(input, window.location.origin);
  if (url.origin !== window.location.origin || !/^\/api\/contabilidad(?:\/|$)/.test(url.pathname)) {
    throw new Error("La solicitud contable debe permanecer en este sitio.");
  }
  const headers = new Headers(init.headers);
  headers.set("x-accounting-request", "1");
  // Existing Flowly login is exchanged for a short-lived HttpOnly accounting cookie.
  // After a reload the cookie works even though the general client uses memory storage.
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) headers.set("authorization", `Bearer ${data.session.access_token}`);
  const response = await fetch(url.pathname + url.search, {
    ...init, headers, credentials: "same-origin", cache: "no-store", redirect: "error",
  });
  if (response.status === 401) window.dispatchEvent(new Event("accounting-session-expired"));
  return response;
}
