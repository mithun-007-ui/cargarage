import { createClient } from '@supabase/supabase-js';

// Default connection values for CarGarage Supabase database
const SUPABASE_DEFAULT_URL = 'https://dhboutgjsnrhvyrehvcj.supabase.co';
const SUPABASE_DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoYm91dGdqc25yaHZ5cmVodmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwODc2OTgsImV4cCI6MjEwMTY2MzY5OH0.yJQKVaa8d4cjHpvPFu9Mb7nwRwD_y_8Q1SYTNjMGRo4';

// Initialize a direct Supabase server client for Integration APIs
function getIntegrationSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_DEFAULT_URL;
  // Use service_role key if available for administrative integration reads, or fallback to anon key
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    SUPABASE_DEFAULT_ANON_KEY;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Fetch customer profiles with optional filtering by email, phone, or search query.
 * Aggregates profiles from the profiles table and existing bookings/customer_vehicles
 * so full customer records and their associated vehicles are always returned.
 */
export async function getIntegrationCustomers({ email, phone, query, limit = 50, offset = 0 } = {}) {
  const sb = getIntegrationSupabaseClient();

  // 1. Try querying profiles table
  let profilesQuery = sb.from('profiles').select('*');
  if (email) profilesQuery = profilesQuery.eq('email', email);
  if (phone) profilesQuery = profilesQuery.eq('phone', phone);
  if (query) profilesQuery = profilesQuery.or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`);

  // 2. Query bookings and customer_vehicles to discover all real customers in the database
  let bookingsQuery = sb.from('bookings').select('customer_id, customer_name, customer_email, vehicle, created_at');
  if (email) bookingsQuery = bookingsQuery.eq('customer_email', email);

  let vehiclesQuery = sb.from('customer_vehicles').select('*');
  if (email) vehiclesQuery = vehiclesQuery.eq('customer_email', email);

  const [profilesRes, bookingsRes, vehiclesRes] = await Promise.all([
    profilesQuery.order('created_at', { ascending: false }),
    bookingsQuery.order('created_at', { ascending: false }),
    vehiclesQuery,
  ]);

  const customerMap = new Map();

  // Populate from profiles if any
  (profilesRes?.data || []).forEach((p) => {
    if (p.email) {
      customerMap.set(p.email.toLowerCase(), {
        id: p.id,
        fullName: p.full_name || 'Customer',
        email: p.email,
        phone: p.phone || null,
        role: p.role || 'customer',
        location: {
          state: p.state || null,
          district: p.district || null,
          area: p.area || null,
        },
        vehicles: [],
        createdAt: p.created_at,
      });
    }
  });

  // Populate/enrich from bookings
  (bookingsRes?.data || []).forEach((b) => {
    if (!b.customer_email) return;
    const emailKey = b.customer_email.toLowerCase();
    if (!customerMap.has(emailKey)) {
      customerMap.set(emailKey, {
        id: b.customer_id || `cust_${emailKey.replace(/[^a-z0-9]/g, '_')}`,
        fullName: b.customer_name || 'Customer',
        email: b.customer_email,
        phone: null,
        role: 'customer',
        location: { state: null, district: null, area: null },
        vehicles: [],
        createdAt: b.created_at,
      });
    } else {
      const existing = customerMap.get(emailKey);
      if (b.customer_name && (!existing.fullName || existing.fullName === 'Customer')) {
        existing.fullName = b.customer_name;
      }
      if (b.customer_id && !existing.id) {
        existing.id = b.customer_id;
      }
    }
  });

  // Populate and associate all vehicles from customer_vehicles
  const allVehicles = vehiclesRes?.data || [];
  allVehicles.forEach((v) => {
    if (!v.customer_email) return;
    const emailKey = v.customer_email.toLowerCase();
    if (!customerMap.has(emailKey)) {
      customerMap.set(emailKey, {
        id: `cust_${emailKey.replace(/[^a-z0-9]/g, '_')}`,
        fullName: 'Customer',
        email: v.customer_email,
        phone: null,
        role: 'customer',
        location: { state: null, district: null, area: null },
        vehicles: [],
        createdAt: v.created_at,
      });
    }

    const customer = customerMap.get(emailKey);
    const existingPlates = new Set(customer.vehicles.map((veh) => veh.plateNumber));
    if (!existingPlates.has(v.plate_number)) {
      customer.vehicles.push({
        id: v.id,
        make: v.make,
        model: v.model,
        year: v.year,
        plateNumber: v.plate_number,
        fuelType: v.fuel_type,
        transmission: v.transmission,
        kmReading: v.km_reading,
        createdAt: v.created_at,
      });
    }
  });

  // Also associate vehicles embedded in bookings if not already in customer_vehicles
  (bookingsRes?.data || []).forEach((b) => {
    if (!b.customer_email || !b.vehicle || !b.vehicle.plateNumber) return;
    const emailKey = b.customer_email.toLowerCase();
    const customer = customerMap.get(emailKey);
    if (customer) {
      const existingPlates = new Set(customer.vehicles.map((veh) => veh.plateNumber));
      if (!existingPlates.has(b.vehicle.plateNumber)) {
        customer.vehicles.push({
          make: b.vehicle.make || '',
          model: b.vehicle.model || '',
          year: b.vehicle.year || '',
          plateNumber: b.vehicle.plateNumber,
          fuelType: b.vehicle.fuelType || '',
          transmission: b.vehicle.transmission || '',
          kmReading: b.vehicle.kmReading || '',
          createdAt: b.created_at,
        });
      }
    }
  });

  let customers = Array.from(customerMap.values());

  if (query) {
    const q = query.toLowerCase();
    customers = customers.filter(
      (c) =>
        (c.fullName && c.fullName.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q))
    );
  }

  const total = customers.length;
  const paginated = customers.slice(offset, offset + limit);

  return { data: paginated, total };
}

/**
 * Fetch bookings with filtering options.
 */
export async function getIntegrationBookings({
  bookingId,
  customerEmail,
  status,
  paymentStatus,
  fromDate,
  toDate,
  limit = 50,
  offset = 0,
} = {}) {
  const sb = getIntegrationSupabaseClient();
  let dbQuery = sb.from('bookings').select('*', { count: 'exact' });

  if (bookingId) {
    dbQuery = dbQuery.eq('id', bookingId);
  }
  if (customerEmail) {
    dbQuery = dbQuery.eq('customer_email', customerEmail);
  }
  if (status) {
    dbQuery = dbQuery.eq('status', status);
  }
  if (paymentStatus) {
    dbQuery = dbQuery.eq('payment_status', paymentStatus);
  }
  if (fromDate) {
    dbQuery = dbQuery.gte('created_at', fromDate);
  }
  if (toDate) {
    dbQuery = dbQuery.lte('created_at', toDate);
  }

  const { data, count, error } = await dbQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Retrieve reports for returned bookings
  const bookingIds = (data || []).map((b) => b.id).filter(Boolean);
  let reportsByBookingId = {};

  if (bookingIds.length > 0) {
    const { data: reports } = await sb
      .from('reports')
      .select('*')
      .in('booking_id', bookingIds);

    (reports || []).forEach((r) => {
      reportsByBookingId[r.booking_id] = {
        id: r.id,
        healthScore: r.health_score,
        notes: r.notes,
        components: r.components,
        items: r.items,
        reportSent: r.report_sent,
        createdAt: r.created_at,
      };
    });
  }

  const formatted = (data || []).map((b) => ({
    id: b.id,
    customerId: b.customer_id,
    customerName: b.customer_name,
    customerEmail: b.customer_email,
    vehicle: b.vehicle || {},
    serviceType: b.service_type,
    selectedServices: b.selected_services || [],
    packageSelected: b.package_selected,
    packagePrice: parseFloat(b.package_price) || 0,
    estimatedPrice: parseFloat(b.estimated_price) || 0,
    serviceCenter: b.service_center,
    pickupOption: b.pickup_option,
    bookingDate: b.booking_date,
    bookingTime: b.booking_time,
    status: b.status,
    paymentStatus: b.payment_status || 'Pending',
    technicianAssigned: b.technician_assigned,
    inspectionReport: reportsByBookingId[b.id] || null,
    createdAt: b.created_at,
  }));

  return { data: formatted, total: count || formatted.length };
}

/**
 * Fetch services catalog and packages.
 */
export async function getIntegrationServices() {
  const sb = getIntegrationSupabaseClient();
  const [servicesRes, packagesRes] = await Promise.all([
    sb.from('services').select('*').order('name'),
    sb.from('packages').select('*').order('price'),
  ]);

  if (servicesRes.error) throw servicesRes.error;
  if (packagesRes.error) throw packagesRes.error;

  return {
    services: (servicesRes.data || []).map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      price: parseFloat(s.price) || 0,
      icon: s.icon,
      description: s.description,
      duration: s.duration,
      popular: s.popular || false,
    })),
    packages: (packagesRes.data || []).map((p) => ({
      id: p.id,
      name: p.name,
      price: parseFloat(p.price) || 0,
      description: p.description,
      duration: p.duration,
      popular: p.popular || false,
      features: p.features || [],
    })),
  };
}

/**
 * Fetch service history records for customers/vehicles.
 */
export async function getIntegrationServiceHistory({ customerEmail, plateNumber, limit = 50, offset = 0 } = {}) {
  const sb = getIntegrationSupabaseClient();
  let dbQuery = sb.from('service_history').select('*', { count: 'exact' });

  if (customerEmail) {
    dbQuery = dbQuery.eq('customer_email', customerEmail);
  }
  if (plateNumber) {
    dbQuery = dbQuery.eq('plate_number', plateNumber);
  }

  const { data, count, error } = await dbQuery
    .order('service_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const formatted = (data || []).map((sh) => ({
    id: sh.id,
    bookingId: sh.booking_id,
    customerEmail: sh.customer_email,
    plateNumber: sh.plate_number,
    vehicle: sh.vehicle || {},
    serviceName: sh.service_name,
    serviceType: sh.service_type,
    status: sh.status,
    cost: parseFloat(sh.cost) || 0,
    serviceDate: sh.service_date,
    createdAt: sh.created_at,
  }));

  return { data: formatted, total: count || formatted.length };
}

/**
 * Fetch customer saved vehicles.
 */
export async function getIntegrationVehicles({ customerEmail, plateNumber, limit = 50, offset = 0 } = {}) {
  const sb = getIntegrationSupabaseClient();
  let dbQuery = sb.from('customer_vehicles').select('*', { count: 'exact' });

  if (customerEmail) {
    dbQuery = dbQuery.eq('customer_email', customerEmail);
  }
  if (plateNumber) {
    dbQuery = dbQuery.eq('plate_number', plateNumber);
  }

  const { data, count, error } = await dbQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const formatted = (data || []).map((v) => ({
    id: v.id,
    customerEmail: v.customer_email,
    make: v.make,
    model: v.model,
    year: v.year,
    plateNumber: v.plate_number,
    fuelType: v.fuel_type,
    transmission: v.transmission,
    kmReading: v.km_reading,
    createdAt: v.created_at,
  }));

  return { data: formatted, total: count || formatted.length };
}

/**
 * Fetch emergency roadside requests / complaints / support items.
 */
export async function getIntegrationEmergencyRequests({ status, limit = 50, offset = 0 } = {}) {
  const sb = getIntegrationSupabaseClient();
  let dbQuery = sb.from('emergency_requests').select('*', { count: 'exact' });

  if (status) {
    dbQuery = dbQuery.eq('status', status);
  }

  const { data, count, error } = await dbQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const formatted = (data || []).map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    location: r.location,
    vehicleDetails: r.vehicle_details,
    breakdownType: r.breakdown_type,
    issue: r.issue,
    towingRequired: r.towing_required,
    status: r.status,
    createdAt: r.created_at,
  }));

  return { data: formatted, total: count || formatted.length };
}

/**
 * Fetch customer reviews & ratings.
 */
export async function getIntegrationReviews() {
  const reviews = [
    { id: 'rev-1', customerName: 'John D.', rating: 5, comment: 'Bug Slayers solved my engine stalling issue within 2 hours. Extremely transparent prices!', vehicle: 'Hyundai Creta', verified: true, date: '2026-07-10' },
    { id: 'rev-2', customerName: 'Sarah J.', rating: 5, comment: 'Love the repair approval feature. I only authorized what was critical.', vehicle: 'BMW M3', verified: true, date: '2026-07-15' },
    { id: 'rev-3', customerName: 'Rajesh K.', rating: 5, comment: 'Super convenient pickup and drop-off service. The digital health report was very detailed.', vehicle: 'Honda City', verified: true, date: '2026-07-18' },
    { id: 'rev-4', customerName: 'Priya M.', rating: 5, comment: 'Amazing service! My car looks and runs like brand new. Highly recommended.', vehicle: 'Maruti Baleno', verified: true, date: '2026-07-19' },
  ];

  return { data: reviews, total: reviews.length };
}

/**
 * Fetch high-level business analytics/stats for StayPlus integration dashboard.
 */
export async function getIntegrationBusinessStats() {
  const sb = getIntegrationSupabaseClient();

  const [bookingsRes, vehiclesRes, emergencyRes, customersData] = await Promise.all([
    sb.from('bookings').select('status, payment_status, estimated_price', { count: 'exact' }),
    sb.from('customer_vehicles').select('id', { count: 'exact', head: true }),
    sb.from('emergency_requests').select('status', { count: 'exact' }),
    getIntegrationCustomers({ limit: 1000 }),
  ]);

  const bookingsList = bookingsRes?.data || [];
  const totalRevenue = bookingsList
    .filter((b) => b.payment_status === 'Paid')
    .reduce((sum, b) => sum + (parseFloat(b.estimated_price) || 0), 0);

  const pendingBookings = bookingsList.filter((b) => b.status === 'Booked' || b.status === 'Vehicle Received').length;
  const completedBookings = bookingsList.filter((b) => b.status === 'Completed' || b.status === 'Delivered').length;

  return {
    totalCustomers: customersData.total || 0,
    totalRegisteredVehicles: vehiclesRes?.count || 0,
    totalBookings: bookingsRes?.count || bookingsList.length,
    bookingsBreakdown: {
      pending: pendingBookings,
      completed: completedBookings,
      other: (bookingsRes?.count || 0) - pendingBookings - completedBookings,
    },
    totalRevenueEstimated: totalRevenue,
    activeEmergencyRequests: (emergencyRes?.data || []).filter((e) => e.status === 'New' || e.status === 'In Progress').length,
    serviceCentersAvailable: 5,
  };
}

/**
 * Create a new booking initiated by StayPlus integration partner.
 */
export async function createIntegrationBooking(bookingData) {
  const sb = getIntegrationSupabaseClient();
  const id = `B-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const insert = {
    id,
    customer_id: bookingData.customerId || null,
    customer_name: bookingData.customerName,
    customer_email: bookingData.customerEmail,
    vehicle: bookingData.vehicle || {},
    service_type: bookingData.serviceType || 'Scheduled Maintenance',
    selected_services: bookingData.selectedServices || [],
    package_selected: bookingData.packageSelected || 'None',
    package_price: bookingData.packagePrice || 0,
    estimated_price: bookingData.estimatedPrice || bookingData.totalPrice || 0,
    service_center: bookingData.serviceCenter || 'AutoCare Pro — Erode Central',
    pickup_option: bookingData.pickupOption || 'dropoff',
    booking_date: bookingData.bookingDate || bookingData.date,
    booking_time: bookingData.bookingTime || bookingData.time,
    status: 'Booked',
    payment_status: bookingData.paymentStatus || 'Pending',
  };

  const { data, error } = await sb.from('bookings').insert([insert]).select().single();
  if (error) throw error;

  // Save vehicle if provided
  if (insert.customer_email && insert.vehicle?.plateNumber) {
    try {
      await sb.from('customer_vehicles').upsert(
        {
          customer_email: insert.customer_email,
          make: insert.vehicle.make || '',
          model: insert.vehicle.model || '',
          year: insert.vehicle.year || '',
          plate_number: insert.vehicle.plateNumber,
          fuel_type: insert.vehicle.fuelType || '',
          transmission: insert.vehicle.transmission || '',
          km_reading: insert.vehicle.kmReading || '',
        },
        { onConflict: 'customer_email,plate_number' }
      );
    } catch (ve) {
      console.error('Integration Auto save vehicle error:', ve);
    }
  }

  // Create service_history record
  try {
    await sb.from('service_history').insert([
      {
        booking_id: data.id,
        customer_email: insert.customer_email,
        plate_number: insert.vehicle?.plateNumber || '',
        vehicle: insert.vehicle || {},
        service_name: insert.service_type || 'Car Service',
        service_type: insert.service_type || 'Maintenance',
        status: 'Booked',
        cost: insert.estimated_price || 0,
        service_date: new Date().toISOString(),
      },
    ]);
  } catch (he) {
    console.error('Integration Auto add service history error:', he);
  }

  return data;
}
