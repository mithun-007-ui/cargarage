import { NextResponse } from 'next/server';
import { validateIntegrationAuth } from '@/lib/integrationAuth';
import { getIntegrationVehicles } from '@/lib/integrationService';

export async function GET(request) {
  const auth = validateIntegrationAuth(request);
  if (!auth.authenticated) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const customerEmail = searchParams.get('customer_email') || searchParams.get('email') || undefined;
    const plateNumber = searchParams.get('plate_number') || searchParams.get('plate') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await getIntegrationVehicles({ customerEmail, plateNumber, limit, offset });

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Integration Vehicles API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
