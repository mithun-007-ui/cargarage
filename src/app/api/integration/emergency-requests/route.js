import { NextResponse } from 'next/server';
import { validateIntegrationAuth } from '@/lib/integrationAuth';
import { getIntegrationEmergencyRequests } from '@/lib/integrationService';

export async function GET(request) {
  const auth = validateIntegrationAuth(request);
  if (!auth.authenticated) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await getIntegrationEmergencyRequests({ status, limit, offset });

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Integration Emergency Requests API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
