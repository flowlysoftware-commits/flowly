"use client";

import { usePathname } from "next/navigation";
import FlowlyCompanionRuntime from "@/components/FlowlyCompanionRuntime";

const HIDDEN_PREFIXES = ["/", "/login", "/registro", "/reservas", "/demo/login"];

function shouldHideCompanion(pathname: string) {
  return HIDDEN_PREFIXES.some((prefix) =>
    prefix === "/" ? pathname === "/" : pathname.startsWith(prefix),
  );
}

export default function FlowlyCompanionGate() {
  const pathname = usePathname() || "/";

  if (shouldHideCompanion(pathname)) return null;

  return <FlowlyCompanionRuntime />;
}
