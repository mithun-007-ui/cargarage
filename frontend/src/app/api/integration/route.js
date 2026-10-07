import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    status: 'online',
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
      note: 'All data endpoints require API key authentication via STAYPLUS_API_KEY.',
    },
    timestamp: new Date().toISOString(),
  });
}
