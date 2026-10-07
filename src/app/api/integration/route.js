import { NextResponse } from 'next/server';
import { validateIntegrationAuth } from '@/lib/integrationAuth';

export async function GET(request) {
  const auth = validateIntegrationAuth(request);
  if (!auth.authenticated) return auth.response;

  return NextResponse.json({
    success: true,
    service: 'CarGarage Partner Integration API',
    version: '1.0.0',
    targetPartner: 'StayPlus',
    endpoints: {
      discovery: '/api/integration',
      stats: '/api/integration/stats',
      customers: '/api/integration/customers',
      bookings: '/api/integration/bookings',
      services: '/api/integration/services',
      serviceHistory: '/api/integration/service-history',
      vehicles: '/api/integration/vehicles',
      emergencyRequests: '/api/integration/emergency-requests',
      reviews: '/api/integration/reviews',
    },
    authentication: {
      type: 'API Key',
      headers: ['Authorization: Bearer <API_KEY>', 'x-api-key: <API_KEY>'],
    },
    timestamp: new Date().toISOString(),
  });
}
