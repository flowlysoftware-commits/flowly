"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { FLOW_TOOL_REGISTRY } from "@/components/flow-engine/tools/registry";
import { FlowToolExecutor } from "@/components/flow-engine/tools/executor";
import type {
  FlowPanelResult,
  FlowPanelTarget,
} from "@/components/flow-engine/types";

const FLOW_PANEL_TARGETS: FlowPanelTarget[] = [
  { key: "area", label: "Área personal", aliases: ["area", "área", "inicio", "panel", "dashboard", "home"], selector: '[data-flow-target="area"], button, a', route: "/dashboard" },
  { key: "flow", label: "Flow Companion", aliases: ["flow", "companion", "asistente"], selector: '[data-flow-target="flow"], button, a', route: "/dashboard" },
  { key: "agenda", label: "Agenda", aliases: ["agenda", "calendario", "citas", "cita"], selector: '[data-flow-target="agenda"], [data-flow-module="agenda-pro"], button, a', route: "/dashboard" },
  { key: "servicios", label: "Servicios", aliases: ["servicio", "servicios"], selector: '[data-flow-target="servicios"], button, a', route: "/dashboard" },
  { key: "empleados", label: "Empleados", aliases: ["empleado", "empleados", "equipo"], selector: '[data-flow-target="empleados"], button, a', route: "/dashboard" },
  { key: "clientes", label: "Clientes", aliases: ["cliente", "clientes", "contacto", "contactos"], selector: '[data-flow-target="clientes"], button, a', route: "/dashboard" },
  { key: "crm", label: "CRM", aliases: ["crm", "clientes", "cliente", "contactos", "contacto"], selector: '[data-flow-module="crm"], [data-flow-target="crm"], [data-flow-target="clientes"], button, a', route: "/dashboard" },
  { key: "recordatorios", label: "Recordatorios", aliases: ["recordatorio", "recordatorios", "alarma", "alarmas"], selector: '[data-flow-target="recordatorios"], button, a', route: "/dashboard" },
  { key: "ajustes", label: "Ajustes", aliases: ["ajuste", "ajustes", "configuracion", "configuración"], selector: '[data-flow-target="ajustes"], button, a', route: "/dashboard" },
  { key: "facturacion", label: "Facturación", aliases: ["facturacion", "facturación", "factura", "facturas", "presupuesto", "presupuestos", "billing"], selector: '[data-flow-target="facturacion"], [data-flow-module="facturacion"], [data-flow-module="billing"], button, a', route: "/dashboard" },
  { key: "stripe", label: "Facturación Stripe", aliases: ["stripe", "facturacion stripe", "facturación stripe", "pagos"], selector: '[data-flow-target="stripe"], button, a', route: "/dashboard" },
  { key: "whatsapp", label: "WhatsApp", aliases: ["whatsapp", "wasap", "wsp", "mensajes"], selector: '[data-flow-module="whatsapp"], [data-flow-target="whatsapp"], button, a', route: "/dashboard" },
  { key: "automatizaciones", label: "Automatizaciones", aliases: ["automatizacion", "automatización", "automatizaciones", "flujos"], selector: '[data-flow-module="automatizaciones"], [data-flow-module="automations"], button, a', route: "/dashboard" },
  { key: "marketing", label: "Marketing", aliases: ["marketing", "campañas", "campanas", "ads"], selector: '[data-flow-module="marketing"], button, a', route: "/dashboard" },
  { key: "estadisticas", label: "Estadísticas", aliases: ["estadisticas", "estadísticas", "metricas", "métricas", "analytics"], selector: '[data-flow-module="estadisticas"], [data-flow-module="analytics"], button, a', route: "/dashboard" },
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function targetMatchesText(target: FlowPanelTarget, text: string) {
  const normalized = normalizeText(text);
  const aliases = [target.key, target.label, ...target.aliases].map(normalizeText);
  return aliases.some((alias) => normalized === alias || normalized.includes(alias));
}

function findTargetByKeyOrText(targetKeyOrText: string) {
  const normalized = normalizeText(targetKeyOrText);
  return (
    FLOW_PANEL_TARGETS.find((target) => target.key === normalized) ||
    FLOW_PANEL_TARGETS.find((target) => targetMatchesText(target, normalized)) ||
    null
  );
}

function getElementLabel(element: HTMLElement) {
  return normalizeText(element.innerText || element.textContent || element.getAttribute("aria-label") || element.title || "");
}

function findTargetElement(target: FlowPanelTarget) {
  const exactCandidates = Array.from(document.querySelectorAll<HTMLElement>(target.selector));
  const direct = exactCandidates.find((element) => {
    const flowTarget = element.getAttribute("data-flow-target");
    const flowModule = element.getAttribute("data-flow-module");
    return flowTarget === target.key || flowModule === target.key;
  });

  if (direct) return direct;

  const allCandidates = Array.from(document.querySelectorAll<HTMLElement>("button, a, [role='button'], [data-flow-target], [data-flow-module]"));
  return allCandidates.find((element) => targetMatchesText(target, getElementLabel(element))) || null;
}

function rectToPayload(rect: DOMRect) {
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
  };
}

function emitPanelEvent(type: string, detail: unknown) {
  window.dispatchEvent(new CustomEvent(type, { detail }));
}

async function wait(ms: number) {
  await new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function navigateToTarget(targetKeyOrText: string): Promise<FlowPanelResult> {
  const target = findTargetByKeyOrText(targetKeyOrText);

  if (!target) {
    const result = { ok: false, message: `No conozco el destino ${targetKeyOrText}.` };
    emitPanelEvent("flow:panel-navigation-failed", result);
    return result;
  }

  if (target.route && !window.location.pathname.startsWith(target.route)) {
    window.localStorage.setItem("flow_pending_navigation_target", target.key);
    window.location.href = target.route;
    const result = { ok: true, target: target.key, label: target.label, message: `Cambiando a ${target.label}.` };
    emitPanelEvent("flow:panel-navigation-route-change", result);
    return result;
  }

  emitPanelEvent("flow:panel-navigation-started", { target: target.key, label: target.label });
  await wait(80);

  let element = findTargetElement(target);
  if (!element) {
    const result = { ok: false, target: target.key, label: target.label, message: `No encuentro ${target.label} en esta pantalla.` };
    emitPanelEvent("flow:panel-navigation-failed", result);
    return result;
  }

  element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  await wait(500);

  element = findTargetElement(target) || element;
  const rect = rectToPayload(element.getBoundingClientRect());

  element.classList.add("flow-panel-target-highlight");
  emitPanelEvent("flow:panel-target-located", { target: target.key, label: target.label, rect });

  await wait(700);
  element.click();

  emitPanelEvent("flow:panel-target-clicked", { target: target.key, label: target.label, rect });
  await wait(450);
  element.classList.remove("flow-panel-target-highlight");

  const result = { ok: true, target: target.key, label: target.label, rect, message: `${target.label} abierto.` };
  emitPanelEvent("flow:panel-navigation-finished", result);
  return result;
}

function getWorkspaceContext() {
  const activeElement = document.querySelector<HTMLElement>('[data-flow-active="true"], .active, [aria-current="page"]');
  const title = document.querySelector("h1")?.textContent || document.title || "Flowly";

  return {
    path: window.location.pathname,
    title,
    activeLabel: activeElement ? activeElement.innerText || activeElement.textContent || null : null,
    targets: FLOW_PANEL_TARGETS.map(({ key, label, aliases }) => ({ key, label, aliases })),
  };
}

export default function FlowPanelIntegrationLayer() {
  const pathname = usePathname();

  useEffect(() => {
    const executor = new FlowToolExecutor();

    window.FlowPanelIntegration = {
      targets: FLOW_PANEL_TARGETS,
      findTarget: findTargetByKeyOrText,
      findElement: (targetKeyOrText: string) => {
        const target = findTargetByKeyOrText(targetKeyOrText);
        return target ? findTargetElement(target) : null;
      },
      navigate: navigateToTarget,
      click: navigateToTarget,
      executeTool: (call) => executor.execute(call, { pathname: window.location.pathname, panel: window.FlowPanelIntegration }),
      capabilities: () => FLOW_TOOL_REGISTRY,
      context: () => ({ ...getWorkspaceContext(), capabilities: FLOW_TOOL_REGISTRY.map(({ id, label, risk }) => ({ id, label, risk })) }),
    };

    const handleNavigateEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ target?: string; text?: string }>).detail;
      const target = detail?.target || detail?.text;
      if (target) void navigateToTarget(target);
    };

    window.addEventListener("flow:panel-navigate", handleNavigateEvent as EventListener);

    return () => {
      window.removeEventListener("flow:panel-navigate", handleNavigateEvent as EventListener);
    };
  }, [pathname]);

  useEffect(() => {
    const pendingTarget = window.localStorage.getItem("flow_pending_navigation_target");
    if (!pendingTarget) return;

    window.localStorage.removeItem("flow_pending_navigation_target");
    window.setTimeout(() => {
      void navigateToTarget(pendingTarget);
    }, 500);
  }, [pathname]);

  return null;
}
