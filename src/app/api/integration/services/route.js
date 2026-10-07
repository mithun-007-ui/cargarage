import { NextResponse } from 'next/server';
import { validateIntegrationAuth } from '@/lib/integrationAuth';
import { getIntegrationServices } from '@/lib/integrationService';

export async function GET(request) {
  const auth = validateIntegrationAuth(request);
  if (!auth.authenticated) return auth.response;

  try {
    const data = await getIntegrationServices();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Integration Services API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
