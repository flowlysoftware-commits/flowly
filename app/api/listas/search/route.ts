import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type GoogleAddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  googleMapsUri?: string;
  addressComponents?: GoogleAddressComponent[];
  businessStatus?: string;
};

type LeadRow = {
  business_name: string;
  business_type: string;
  country: string;
  province: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  google_rating: number;
  google_reviews: number;
  website: string;
  google_maps_uri: string;
  google_place_id: string;
  source: string;
  worked: boolean;
  worked_by: string;
  status: string;
  notes: string;
};

const countryCodes: Record<string, string> = {
  España: "ES",
  Spain: "ES",
  Colombia: "CO",
  Ecuador: "EC",
  Venezuela: "VE",
  México: "MX",
  Mexico: "MX",
  "Puerto Rico": "PR",
};

function pickAddressPart(components: GoogleAddressComponent[] | undefined, types: string[]) {
  const found = components?.find((component) => types.some((type) => component.types?.includes(type)));
  return found?.longText || found?.shortText || "";
}

function buildQuery({ businessType, country, province, city }: { businessType: string; country: string; province: string; city: string }) {
  const area = [city, province, country].filter(Boolean).join(", ");
  return `${businessType || "peluquería"} en ${area || country || "España"}`;
}

function toLeadRow(place: GooglePlace, params: { businessType: string; country: string; province: string; city: string }): LeadRow {
  const components = place.addressComponents;
  const phone = place.internationalPhoneNumber || place.nationalPhoneNumber || "";
  const detectedProvince = pickAddressPart(components, ["administrative_area_level_2", "administrative_area_level_1"]);
  const detectedCity = pickAddressPart(components, ["locality", "postal_town", "administrative_area_level_3"]);

  return {
    business_name: place.displayName?.text || "Negocio sin nombre",
    business_type: params.businessType,
    country: params.country,
    province: detectedProvince || params.province,
    city: detectedCity || params.city,
    address: place.formattedAddress || "",
    phone,
    whatsapp: phone,
    google_rating: Number(place.rating || 0),
    google_reviews: Number(place.userRatingCount || 0),
    website: place.websiteUri || "",
    google_maps_uri: place.googleMapsUri || "",
    google_place_id: place.id || "",
    source: "google_places",
    worked: false,
    worked_by: "",
    status: "pendiente",
    notes: place.googleMapsUri ? `Importado desde Google Places. Ficha: ${place.googleMapsUri}` : "Importado desde Google Places.",
  };
}

async function searchPlaces(params: { businessType: string; country: string; province: string; city: string; minReviews: number; limit: number }) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("Falta configurar GOOGLE_PLACES_API_KEY en Vercel > Settings > Environment Variables.");
  }

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.nationalPhoneNumber",
        "places.internationalPhoneNumber",
        "places.rating",
        "places.userRatingCount",
        "places.websiteUri",
        "places.googleMapsUri",
        "places.addressComponents",
        "places.businessStatus",
      ].join(","),
    },
    body: JSON.stringify({
      textQuery: buildQuery(params),
      regionCode: countryCodes[params.country] || "ES",
      languageCode: "es",
      pageSize: Math.min(params.limit, 20),
    }),
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Google Places ha devuelto un error ${response.status}: ${details.slice(0, 280)}`);
  }

  const data = await response.json();
  const places = Array.isArray(data.places) ? (data.places as GooglePlace[]) : [];
  return places
    .filter((place) => place.businessStatus !== "CLOSED_PERMANENTLY")
    .filter((place) => Number(place.userRatingCount || 0) >= params.minReviews)
    .slice(0, params.limit)
    .map((place) => toLeadRow(place, params));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const params = {
      businessType: String(body.businessType || "Peluquería").trim(),
      country: String(body.country || "España").trim(),
      province: String(body.province || "").trim(),
      city: String(body.city || "").trim(),
      minReviews: Math.max(Number(body.minReviews || 0), 0),
      limit: Math.min(Math.max(Number(body.limit || 20), 1), 60),
    };

    const leads = await searchPlaces(params);
    if (!leads.length) {
      return NextResponse.json({ leads: [], inserted: 0, duplicates: 0 });
    }

    const { data, error } = await supabaseAdmin
      .from("flowly_prospecting_leads")
      .upsert(leads, { onConflict: "google_place_id", ignoreDuplicates: true })
      .select("*");

    if (error) {
      return NextResponse.json(
        { error: "La búsqueda funcionó, pero no se pudo guardar en Supabase. Ejecuta el SQL que te he pasado.", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ leads: data || [], inserted: data?.length || 0, duplicates: Math.max(leads.length - (data?.length || 0), 0) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se ha podido completar la búsqueda real." },
      { status: 500 },
    );
  }
}
