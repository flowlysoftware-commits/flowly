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

  const collected: LeadRow[] = [];
  let pageToken = "";
  let pages = 0;
  const maxCollect = Math.min(Math.max(params.limit * 3, params.limit), 60);
  const maxPages = Math.ceil(maxCollect / 20) || 1;

  while (collected.length < maxCollect && pages < maxPages) {
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
          "nextPageToken",
        ].join(","),
      },
      body: JSON.stringify({
        textQuery: buildQuery(params),
        regionCode: countryCodes[params.country] || "ES",
        languageCode: "es",
        pageSize: Math.min(20, maxCollect),
        ...(pageToken ? { pageToken } : {}),
      }),
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Google Places ha devuelto un error ${response.status}: ${details.slice(0, 280)}`);
    }

    const data = await response.json();
    pages += 1;
    const places = Array.isArray(data.places) ? (data.places as GooglePlace[]) : [];
    const rows = places
      .filter((place) => place.businessStatus !== "CLOSED_PERMANENTLY")
      .filter((place) => Number(place.userRatingCount || 0) >= params.minReviews)
      .map((place) => toLeadRow(place, params));

    for (const row of rows) {
      if (collected.length >= maxCollect) break;
      if (row.google_place_id && !collected.some((lead) => lead.google_place_id === row.google_place_id)) collected.push(row);
    }

    pageToken = typeof data.nextPageToken === "string" ? data.nextPageToken : "";
    if (!pageToken) break;
  }

  return { leads: collected.slice(0, maxCollect), pages };
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

    const searchResult = await searchPlaces(params);
    const leads = searchResult.leads;
    if (!leads.length) {
      return NextResponse.json({ leads: [], inserted: 0, duplicates: 0 });
    }

    const placeIds = leads.map((lead) => lead.google_place_id).filter(Boolean);

    const { data: existingRows, error: existingError } = await supabaseAdmin
      .from("flowly_prospecting_leads")
      .select("google_place_id")
      .in("google_place_id", placeIds);

    if (existingError) {
      return NextResponse.json(
        {
          error: "La búsqueda funcionó, pero Flowly no puede leer la tabla de Supabase.",
          details: existingError.message,
          hint: "Ejecuta el SQL actualizado y revisa que NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY estén configuradas en Vercel.",
        },
        { status: 500 },
      );
    }

    const existingIds = new Set((existingRows || []).map((row) => row.google_place_id));
    const newLeads = leads.filter((lead) => lead.google_place_id && !existingIds.has(lead.google_place_id)).slice(0, params.limit);

    let insertedRows: LeadRow[] = [];
    if (newLeads.length > 0) {
      const { data: insertedData, error: insertError } = await supabaseAdmin
        .from("flowly_prospecting_leads")
        .insert(newLeads)
        .select("*");

      if (insertError) {
        return NextResponse.json(
          {
            error: "La búsqueda funcionó, pero no se pudo guardar en Supabase.",
            details: insertError.message,
            hint: "Ejecuta el SQL actualizado de supabase/flowly_leads_ia.sql. Si sigue fallando, revisa que SUPABASE_SERVICE_ROLE_KEY esté en Vercel y vuelve a desplegar.",
          },
          { status: 500 },
        );
      }
      insertedRows = insertedData || [];
    }

    const { data: refreshedRows } = await supabaseAdmin
      .from("flowly_prospecting_leads")
      .select("*")
      .in("google_place_id", placeIds)
      .order("google_reviews", { ascending: false });

    return NextResponse.json({
      leads: refreshedRows || insertedRows,
      inserted: insertedRows.length,
      duplicates: leads.length - insertedRows.length,
      found: leads.length,
      pages: searchResult.pages,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se ha podido completar la búsqueda real." },
      { status: 500 },
    );
  }
}
