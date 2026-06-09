export type SalesRole = "director" | "jefe" | "senior" | "asociado";

export type SalesUserLite = {
  id: string;
  full_name?: string | null;
  role: SalesRole;
  manager_id?: string | null;
};

export type CommissionRule = {
  role: SalesRole;
  directSalePct: number;
  directMonthlyPct: number;
  branchSalePct: number;
  branchMonthlyPct: number;
};

export type CommissionLine = {
  sales_user_id: string;
  source_sales_user_id: string;
  amount: number;
  type: "direct_sale" | "direct_monthly" | "branch_sale" | "branch_monthly";
  status: "pending";
  source: string;
  description: string;
  base_amount: number;
  percentage: number;
  hierarchy_level: number;
};

export const COMMISSION_RULES: Record<SalesRole, CommissionRule> = {
  asociado: { role: "asociado", directSalePct: 10, directMonthlyPct: 5, branchSalePct: 0, branchMonthlyPct: 0 },
  senior: { role: "senior", directSalePct: 15, directMonthlyPct: 7, branchSalePct: 2, branchMonthlyPct: 2 },
  jefe: { role: "jefe", directSalePct: 20, directMonthlyPct: 8, branchSalePct: 4, branchMonthlyPct: 4 },
  director: { role: "director", directSalePct: 25, directMonthlyPct: 10, branchSalePct: 6, branchMonthlyPct: 6 },
};

export const FIRST_BRANCH_RULE = { salePct: 8, monthlyPct: 5, maxLevels: 5 };

export function moneyAmount(value: number) {
  return Math.round(Number(value || 0) * 100) / 100;
}

export function getCommissionRule(role?: string | null) {
  return COMMISSION_RULES[(role || "asociado") as SalesRole] || COMMISSION_RULES.asociado;
}

export function getUplineChain(salesUserId: string, users: SalesUserLite[], maxLevels = FIRST_BRANCH_RULE.maxLevels) {
  const byId = new Map(users.map((user) => [user.id, user]));
  const chain: Array<SalesUserLite & { hierarchy_level: number }> = [];
  let current = byId.get(salesUserId);
  const seen = new Set<string>([salesUserId]);

  for (let level = 1; level <= maxLevels; level += 1) {
    const managerId = current?.manager_id;
    if (!managerId || seen.has(managerId)) break;
    const manager = byId.get(managerId);
    if (!manager) break;
    chain.push({ ...manager, hierarchy_level: level });
    seen.add(manager.id);
    current = manager;
  }

  return chain;
}

export function buildCommissionLines(input: {
  seller: SalesUserLite;
  users: SalesUserLite[];
  clientName: string;
  saleBaseAmount: number;
  monthlyAmount: number;
  source: string;
}) {
  const sellerRule = getCommissionRule(input.seller.role);
  const saleBase = Number(input.saleBaseAmount || 0);
  const monthly = Number(input.monthlyAmount || 0);
  const descriptionClient = input.clientName || "cliente";
  const lines: CommissionLine[] = [];

  const addLine = (line: Omit<CommissionLine, "status" | "source_sales_user_id" | "source">) => {
    if (line.amount <= 0 || line.percentage <= 0 || line.base_amount <= 0) return;
    lines.push({ ...line, status: "pending", source_sales_user_id: input.seller.id, source: input.source });
  };

  addLine({
    sales_user_id: input.seller.id,
    amount: moneyAmount(saleBase * (sellerRule.directSalePct / 100)),
    type: "direct_sale",
    description: `${sellerRule.directSalePct}% venta directa · ${descriptionClient}`,
    base_amount: saleBase,
    percentage: sellerRule.directSalePct,
    hierarchy_level: 0,
  });

  addLine({
    sales_user_id: input.seller.id,
    amount: moneyAmount(monthly * (sellerRule.directMonthlyPct / 100)),
    type: "direct_monthly",
    description: `${sellerRule.directMonthlyPct}% mensual directa · ${descriptionClient}`,
    base_amount: monthly,
    percentage: sellerRule.directMonthlyPct,
    hierarchy_level: 0,
  });

  getUplineChain(input.seller.id, input.users).forEach((manager) => {
    const roleRule = getCommissionRule(manager.role);
    const salePct = manager.hierarchy_level === 1 ? FIRST_BRANCH_RULE.salePct : roleRule.branchSalePct;
    const monthlyPct = manager.hierarchy_level === 1 ? FIRST_BRANCH_RULE.monthlyPct : roleRule.branchMonthlyPct;

    addLine({
      sales_user_id: manager.id,
      amount: moneyAmount(saleBase * (salePct / 100)),
      type: "branch_sale",
      description: `${salePct}% venta rama nivel ${manager.hierarchy_level} · ${descriptionClient}`,
      base_amount: saleBase,
      percentage: salePct,
      hierarchy_level: manager.hierarchy_level,
    });

    addLine({
      sales_user_id: manager.id,
      amount: moneyAmount(monthly * (monthlyPct / 100)),
      type: "branch_monthly",
      description: `${monthlyPct}% mensual rama nivel ${manager.hierarchy_level} · ${descriptionClient}`,
      base_amount: monthly,
      percentage: monthlyPct,
      hierarchy_level: manager.hierarchy_level,
    });
  });

  return lines;
}
