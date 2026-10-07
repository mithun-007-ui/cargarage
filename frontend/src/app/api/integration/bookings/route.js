import { NextResponse } from 'next/server';
import { validateIntegrationAuth } from '@/lib/integrationAuth';
import { getIntegrationBookings, createIntegrationBooking } from '@/lib/integrationService';

export async function GET(request) {
  const auth = validateIntegrationAuth(request);
  if (!auth.authenticated) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id') || searchParams.get('id') || undefined;
    const customerEmail = searchParams.get('customer_email') || searchParams.get('email') || undefined;
    const status = searchParams.get('status') || undefined;
    const paymentStatus = searchParams.get('payment_status') || undefined;
    const fromDate = searchParams.get('from_date') || undefined;
    const toDate = searchParams.get('to_date') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await getIntegrationBookings({
      bookingId,
      customerEmail,
      status,
      paymentStatus,
      fromDate,
      toDate,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Integration Bookings API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = validateIntegrationAuth(request);
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();

    if (!body.customerName || !body.customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Bad Request', message: 'customerName and customerEmail are required.' },
        { status: 400 }
      );
    }

    const newBooking = await createIntegrationBooking(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Booking created successfully via StayPlus integration.',
        data: newBooking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Integration Create Booking Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
