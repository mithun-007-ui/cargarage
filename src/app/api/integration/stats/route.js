import { NextResponse } from 'next/server';
import { validateIntegrationAuth } from '@/lib/integrationAuth';
import { getIntegrationBusinessStats } from '@/lib/integrationService';

export async function GET(request) {
  const auth = validateIntegrationAuth(request);
  if (!auth.authenticated) return auth.response;

  try {
    const data = await getIntegrationBusinessStats();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Integration Stats API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
