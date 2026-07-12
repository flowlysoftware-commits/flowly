import { supabase } from "@/lib/supabaseClient";

export type FlowCompanionIdentity = Readonly<{
  userId: string;
  businessId: string;
  accessToken: string;
  scopeId: string;
}>;

function normalizeScopePart(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 100);
}

export async function resolveFlowCompanionIdentity(): Promise<FlowCompanionIdentity | null> {
  const [{ data: sessionData }, { data: userData }] = await Promise.all([
    supabase.auth.getSession(),
    supabase.auth.getUser(),
  ]);

  const user = userData.user;
  const accessToken = sessionData.session?.access_token || "";
  if (!user || !accessToken) return null;

  const { data: business, error } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error || !business?.id) return null;

  const userId = String(user.id);
  const businessId = String(business.id);
  return {
    userId,
    businessId,
    accessToken,
    scopeId: `${normalizeScopePart(userId)}__${normalizeScopePart(businessId)}`,
  };
}

export function scopedFlowStorageKey(baseKey: string, identity: FlowCompanionIdentity) {
  return `${baseKey}__${identity.scopeId}`;
}
