import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    companion: {
      id: 'flow-companion-dev',
      name: 'Flow',
      language: 'es',
      voice: 'nova',
      personality: 'Empático, natural, atento y cercano',
      model: 'gpt-realtime',
      memoryEnabled: true,
      emotionEnabled: true
    }
  });
}
