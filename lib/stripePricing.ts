export type FlowlyCountry = "VE" | "ES" | "CO" | "EC" | "PR";
export type FlowlyCurrency = "EUR" | "COP" | "USD";

export type FlowlyMarket = {
  country: FlowlyCountry;
  currency: FlowlyCurrency;
  rate: number;
  stripeCurrency: Lowercase<FlowlyCurrency>;
  unitMultiplier: number;
};

const markets: Record<FlowlyCountry, FlowlyMarket> = {
  VE: { country: "VE", currency: "USD", rate: 1.08, stripeCurrency: "usd", unitMultiplier: 100 },
  ES: { country: "ES", currency: "EUR", rate: 1, stripeCurrency: "eur", unitMultiplier: 100 },
  CO: { country: "CO", currency: "COP", rate: 4300, stripeCurrency: "cop", unitMultiplier: 1 },
  EC: { country: "EC", currency: "USD", rate: 1.08, stripeCurrency: "usd", unitMultiplier: 100 },
  PR: { country: "PR", currency: "USD", rate: 1.08, stripeCurrency: "usd", unitMultiplier: 100 },
};

export function resolveFlowlyMarket(country?: unknown, currency?: unknown): FlowlyMarket {
  const normalizedCountry = String(country || "").trim().toUpperCase() as FlowlyCountry;
  if (normalizedCountry in markets) return markets[normalizedCountry];

  const normalizedCurrency = String(currency || "").trim().toUpperCase();
  if (normalizedCurrency === "USD") return markets.EC;
  if (normalizedCurrency === "COP") return markets.CO;
  return markets.ES;
}

export function convertBasePrice(amountInEur: number, market: FlowlyMarket) {
  return Number((amountInEur * market.rate).toFixed(2));
}

export function stripeUnitAmount(amountInDisplayCurrency: number, market: FlowlyMarket) {
  return Math.round(amountInDisplayCurrency * market.unitMultiplier);
}
