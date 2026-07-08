import { NextResponse } from "next/server";

export const FLOW_COMPANION_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Flow-Companion-Secret",
  "Access-Control-Max-Age": "86400",
};

export function companionJson(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...FLOW_COMPANION_CORS_HEADERS,
      ...(init?.headers || {}),
    },
  });
}

export function companionOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: FLOW_COMPANION_CORS_HEADERS,
  });
}
