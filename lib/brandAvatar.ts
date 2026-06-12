import { Buffer } from "node:buffer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type GenerateBrandAvatarInput = {
  businessId: string;
  businessName: string;
  businessType?: string | null;
  logoUrl?: string | null;
  avatarName?: string | null;
  avatarStyle?: string | null;
  avatarPersonality?: string | null;
  brandColors?: string[] | null;
};

const styleLabels: Record<string, string> = {
  "robot-premium": "robot premium SaaS, friendly, elegant, high-end, not childish",
  "humanoide-corporativo": "corporate humanoid assistant, elegant, trustworthy, modern",
  "animal-futurista": "futuristic animal mascot, premium brand character, polished",
  "minimalista-branding": "minimalist brand mascot, clean geometric shapes, iconic and simple",
  "cyberpunk-elegante": "elegant cyberpunk assistant, subtle neon, professional and premium",
};

export function buildBrandAvatarPrompt(input: GenerateBrandAvatarInput) {
  const style = styleLabels[input.avatarStyle || ""] || styleLabels["robot-premium"];
  const colors = input.brandColors?.filter(Boolean).join(", ") || "electric blue, violet and cyan accents";

  return [
    `Create a premium full-body SaaS brand mascot character for a business called ${input.businessName}.`,
    `Business type: ${input.businessType || "local business"}.`,
    `Mascot name: ${input.avatarName || "Nia"}.`,
    `Visual style: ${style}.`,
    `Personality: ${input.avatarPersonality || "warm, strategic, helpful and sales-oriented"}.`,
    `Use brand colors: ${colors}.`,
    input.logoUrl ? `The business logo is available at this URL for brand inspiration: ${input.logoUrl}. Use its visual language and colors as inspiration, but do not copy text or recreate the exact logo.` : "Use a modern premium identity inspired by tech SaaS products.",
    "Full body visible from head to feet, standing pose, arms and legs visible, character-ready for UI animation, clean silhouette, centered character with generous padding, transparent-looking background feel, dark premium glassmorphism context, soft glow, high detail, corporate quality.",
    "No text, no letters, no watermark, no extra logos, no mockup, no UI, no background clutter, do not crop the head or feet.",
  ].join(" ");
}

export async function generateAndStoreBrandAvatar(input: GenerateBrandAvatarInput) {
  if (!process.env.OPENAI_API_KEY) throw new Error("Falta OPENAI_API_KEY en variables de entorno");

  const prompt = buildBrandAvatarPrompt(input);

  const imageRes = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      quality: "low",
      n: 1,
    }),
  });

  const imageJson = await imageRes.json();
  if (!imageRes.ok) throw new Error(imageJson?.error?.message || "OpenAI no pudo generar la mascota IA");

  const b64 = imageJson?.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI no devolvió imagen en b64_json");

  const buffer = Buffer.from(b64, "base64");
  const safeName = (input.avatarName || "avatar").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "avatar";
  const filePath = `${input.businessId}/${safeName}-${Date.now()}.png`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("business-avatars")
    .upload(filePath, buffer, { contentType: "image/png", upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrlData } = supabaseAdmin.storage.from("business-avatars").getPublicUrl(filePath);
  const avatarUrl = publicUrlData.publicUrl;

  const row = {
    business_id: input.businessId,
    avatar_name: input.avatarName || "Nia",
    avatar_style: input.avatarStyle || "robot-premium",
    avatar_personality: input.avatarPersonality || "cercana, estratégica y muy orientada a ventas",
    logo_url: input.logoUrl || null,
    avatar_url: avatarUrl,
    prompt,
    brand_colors: input.brandColors || [],
    updated_at: new Date().toISOString(),
  };

  const { data: avatar, error: dbError } = await supabaseAdmin
    .from("business_avatars")
    .upsert(row, { onConflict: "business_id" })
    .select("*")
    .single();

  if (dbError) throw new Error(dbError.message);
  return avatar;
}
