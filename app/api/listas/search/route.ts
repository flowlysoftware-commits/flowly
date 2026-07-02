import { NextRequest, NextResponse } from "next/server";

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

const countryCodes: Record<string, string> = {
  España: "ES",
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

function buildQuery({ businessType, province, city, country }: Record<string, string>) {
  return [businessType || "peluquería", city, province, country].filter(Boolean).join(" en ").replace(/ en en /g, " en ");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const businessType = String(body.businessType || "peluquería").trim();
    const country = String(body.country || "España").trim();
    const province = String(body.province || "").trim();
    const city = String(body.city || "").trim();
    const minReviews = Number(body.minReviews || 0);
    const limit = Math.min(Math.max(Number(body.limit || 20), 1), 60);
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Falta configurar GOOGLE_PLACES_API_KEY en las variables de entorno de Vercel." },
        { status: 500 },
      );
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
        textQuery: buildQuery({ businessType, province, city, country }),
        regionCode: countryCodes[country] || "ES",
        languageCode: "es",
        pageSize: Math.min(limit, 20),
      }),
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Google Places ha devuelto un error (${response.status}).`, details: errorText.slice(0, 500) },
        { status: response.status },
      );
    }

    const data = await response.json();
    const places = Array.isArray(data.places) ? (data.places as GooglePlace[]) : [];
    const leads = places
      .filter((place) => Number(place.userRatingCount || 0) >= minReviews)
      .slice(0, limit)
      .map((place) => {
        const components = place.addressComponents;
        const detectedProvince = pickAddressPart(components, ["administrative_area_level_2", "administrative_area_level_1"]);
        const detectedCity = pickAddressPart(components, ["locality", "postal_town", "administrative_area_level_3"]);
        const phone = place.internationalPhoneNumber || place.nationalPhoneNumber || "";
        return {
          id: place.id || `google-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          businessName: place.displayName?.text || "Negocio sin nombre",
          country,
          province: detectedProvince || province,
          city: detectedCity || city,
          address: place.formattedAddress || "",
          phone,
          whatsapp: phone,
          googleRating: Number(place.rating || 0),
          googleReviews: Number(place.userRatingCount || 0),
          website: place.websiteUri || "",
          instagram: "",
          email: "",
          bookingSoftware: "Pendiente de revisar",
          worked: false,
          workedBy: "",
          status: "pendiente",
          lastContact: "",
          notes: place.googleMapsUri ? `Ficha Google: ${place.googleMapsUri}` : "Resultado importado desde Google Places.",
          googlePlaceId: place.id || "",
          googleMapsUri: place.googleMapsUri || "",
          source: "google_places",
        };
      });

    return NextResponse.json({ leads });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se ha podido completar la búsqueda." },
      { status: 500 },
    );
  }
}
