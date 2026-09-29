"use client";

export async function accountingFetch(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("x-accounting-request", "1");
  const response = await fetch(input, { ...init, headers, credentials: "same-origin", cache: "no-store" });
  if (response.status === 401) window.dispatchEvent(new Event("accounting-session-expired"));
  return response;
}
