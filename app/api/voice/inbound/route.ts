import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const raw = await req.text();

    console.log("RAW BODY:", raw);

    return NextResponse.json({
      success: true,
      raw,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
}
