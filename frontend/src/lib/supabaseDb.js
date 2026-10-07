/**
 * supabaseDb.js
 * Drop-in replacement for mockDb.js - uses Supabase instead of localStorage.
 * All functions that hit the DB are async.
 */

import { createClient } from '@/utils/supabase/client';

function supabase() {
  return createClient();
}

// Normalize booking row from Supabase columns to app shape
function normalizeBooking(row) {
  if (!row) return null;
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerId: row.customer_id,
    vehicle: row.vehicle || {},
    serviceType: row.service_type,
    selectedServices: row.selected_services || [],
    packageSelected: row.package_selected || 'None',
    packagePrice: parseFloat(row.package_price) || 0,
    estimatedPrice: parseFloat(row.estimated_price) || 0,
    serviceCenter: row.service_center,
    pickupOption: row.pickup_option,
    date: row.booking_date || row.date,
    time: row.booking_time || row.time,
    status: row.status || 'Booked',
    technicianAssigned: row.technician_assigned || row.technician,
    healthReport: row.reports ? normalizeReport(row.reports) : null,
    createdAt: row.created_at,
  };
}

function normalizeReport(row) {
  if (!row) return null;
  return {
    inspectedAt: row.created_at,
    notes: row.notes,
    healthScore: row.health_score || 85,
    reportSent: row.report_sent || false,
    components: row.components || {},
    items: row.items || [],
  };
}

// ---- BOOKINGS ----

// Helper: fetch health report for a booking id
async function fetchHealthReport(sb, bookingId) {
  const { data } = await sb.from('reports').select('*').eq('booking_id', bookingId).maybeSingle();
  return data ? normalizeReport(data) : null;
}

export async function getBookings() {
  const sb = supabase();
  const { data, error } = await sb
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getBookings error:', error.message); return []; }
  return (data || []).map(b => ({ ...normalizeBooking(b), healthReport: null }));
}

export async function getBookingById(id) {
  const sb = supabase();
  const { data, error } = await sb
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();
  if (error) { console.error('getBookingById error:', error.message, '| id:', id); return null; }
  const healthReport = await fetchHealthReport(sb, id);
  return { ...normalizeBooking(data), healthReport };
}

export async function getBookingsByEmail(email) {
  const sb = supabase();
  const { data, error } = await sb
    .from('bookings')
    .select('*')
    .eq('customer_email', email)
    .order('created_at', { ascending: false });
  if (error) { console.error('getBookingsByEmail error:', error.message); return []; }
  return (data || []).map(b => ({ ...normalizeBooking(b), healthReport: null }));
}

export async function addBooking(booking) {
  const sb = supabase();
  const { data: { user } } = await sb.auth.getUser().catch(() => ({ data: { user: null } }));

  const id = `B-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const insert = {
    id,
    customer_id: user?.id || null,
    customer_name: booking.customerName,
    customer_email: booking.customerEmail,
    vehicle: booking.vehicle,
    service_type: booking.serviceType,
    selected_services: booking.selectedServices || [],
    package_selected: booking.packageSelected || 'None',
    package_price: booking.packagePrice || 0,
    estimated_price: booking.estimatedPrice || booking.totalPrice || 0,
    service_center: booking.serviceCenter,
    pickup_option: booking.pickupOption,
    booking_date: booking.date,
    booking_time: booking.time,
    status: 'Booked',
  };

  const { data, error } = await sb.from('bookings').insert([insert]).select().single();
  if (error) { 
    console.error('addBooking error code:', error?.code);
    console.error('addBooking error message:', error?.message);
    console.error('addBooking error details:', error?.details);
    console.error('addBooking error hint:', error?.hint);
    throw error; 
  }

  // Save vehicle to customer_vehicles SQL table
  if (booking.customerEmail && booking.vehicle && booking.vehicle.plateNumber) {
    try {
      await addSavedVehicle(booking.customerEmail, booking.vehicle);
    } catch (ve) {
      console.error('Auto save vehicle error:', ve);
    }
  }

  // Add record to service_history SQL table
  if (booking.customerEmail) {
    try {
      await addServiceHistory({
        booking_id: data.id,
        customer_email: booking.customerEmail,
        plate_number: booking.vehicle?.plateNumber || '',
        vehicle: booking.vehicle || {},
        service_name: booking.serviceType || 'Car Service',
        service_type: booking.serviceType || 'Maintenance',
        status: 'Booked',
        cost: booking.estimatedPrice || booking.totalPrice || 0,
      });
    } catch (he) {
      console.error('Auto add service history error:', he);
    }
  }

  await addNotification(booking.customerEmail, `Booking Confirmed! Your booking ID is ${data.id}.`);
  await addNotification('admin', `New Booking: ${booking.customerName} scheduled a service (ID: ${data.id}).`);

  return normalizeBooking(data);
}

export async function updateBookingStatus(id, status) {
  const sb = supabase();
  const { data, error } = await sb
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateBookingStatus error:', error); return null; }

  // Sync status to service_history SQL table
  try {
    await sb.from('service_history').update({ status }).eq('booking_id', id);
  } catch (shErr) {
    console.error('update service_history status error:', shErr);
  }

  const email = data.customer_email;
  const veh = `${data.vehicle?.make || ''} ${data.vehicle?.model || ''}`.trim();
  if (status === 'Vehicle Received') await addNotification(email, `Vehicle Received: Your ${veh} has been checked in.`);
  else if (status === 'Inspection Started') await addNotification(email, `Inspection Started: A technician is running diagnostics on your vehicle.`);
  else if (status === 'Waiting for Approval') await addNotification(email, `Repair Approval Requested: Please review and approve the recommended repairs.`);
  else if (status === 'Ready for Delivery') await addNotification(email, `Vehicle Ready: All repairs and inspections are complete.`);
  else if (status === 'Completed' || status === 'Delivered') await addNotification(email, `Vehicle Delivered: Service completed. Thank you!`);

  return normalizeBooking(data);
}

export async function assignTechnician(id, technicianName) {
  const sb = supabase();
  const { data, error } = await sb
    .from('bookings')
    .update({ technician_assigned: technicianName, status: 'Inspection Started' })
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('assignTechnician error:', error.message); return null; }
  if (data?.customer_email) await addNotification(data.customer_email, `Technician Assigned: ${technicianName} is performing the inspection.`);
  return normalizeBooking(data);
}

// ---- HEALTH REPORTS ----

export async function addHealthReport(bookingId, notes, items, healthScore, components) {
  const sb = supabase();
  const { data: existing } = await sb.from('reports').select('id').eq('booking_id', bookingId).maybeSingle();

  const reportData = {
    booking_id: bookingId,
    notes,
    health_score: healthScore || 85,
    report_sent: false,
    components: components || {},
    items: items.map(item => ({ ...item, approved: null })),
  };

  let report;
  if (existing) {
    const { data, error } = await sb.from('reports').update(reportData).eq('booking_id', bookingId).select().single();
    if (error) throw error;
    report = data;
  } else {
    const { data, error } = await sb.from('reports').insert(reportData).select().single();
    if (error) throw error;
    report = data;
  }

  await sb.from('bookings').update({ status: 'Inspection Completed' }).eq('id', bookingId);
  await addNotification('admin', `Inspection Finished: Report generated for Booking ${bookingId}.`);
  return report;
}

export async function sendReportToCustomer(bookingId) {
  const sb = supabase();
  await sb.from('reports').update({ report_sent: true }).eq('booking_id', bookingId);
  await sb.from('bookings').update({ status: 'Waiting for Approval' }).eq('id', bookingId);
  const { data: booking } = await sb.from('bookings').select('customer_email').eq('id', bookingId).single();
  if (booking) await addNotification(booking.customer_email, `Your vehicle inspection is complete. Please review and approve the recommended repairs.`);
}

export async function updateHealthReportItem(bookingId, itemIndex, approved) {
  const sb = supabase();
  const { data: report } = await sb.from('reports').select('*').eq('booking_id', bookingId).single();
  if (!report) return null;

  const items = [...(report.items || [])];
  if (items[itemIndex]) items[itemIndex].approved = approved;

  await sb.from('reports').update({ items }).eq('booking_id', bookingId);

  const allReviewed = items.every(item => item.approved !== null);
  if (allReviewed) {
    await sb.from('bookings').update({ status: 'Customer Approved Repairs' }).eq('id', bookingId);
    const { data: booking } = await sb.from('bookings').select('customer_email').eq('id', bookingId).single();
    const approvedCount = items.filter(i => i.approved === true).length;
    const rejectedCount = items.filter(i => i.approved === false).length;
    if (booking) await addNotification(booking.customer_email, `Decisions submitted: ${approvedCount} approved, ${rejectedCount} rejected.`);
    await addNotification('admin', `Customer decided on Booking ${bookingId}: ${approvedCount} approved, ${rejectedCount} rejected.`);
  }
}

// ---- SERVICES ----

export async function getServices() {
  const sb = supabase();
  const { data, error } = await sb.from('services').select('*');
  if (error) { console.error('getServices error:', error); return []; }
  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    category: row.category,
    icon: row.icon,
    description: row.description || '',
    price: parseFloat(row.price) || 0,
    duration: row.duration || '',
    popular: row.popular || false,
  }));
}

// ---- PACKAGES ----

export async function getPackages() {
  const sb = supabase();
  const { data, error } = await sb.from('packages').select('*');
  if (error) { console.error('getPackages error:', error); return []; }
  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    price: parseFloat(row.price) || 0,
    description: row.description || '',
    duration: row.duration || '',
    popular: row.popular || false,
    features: Array.isArray(row.features) ? row.features : [],
  }));
}

// ---- NOTIFICATIONS ----

export async function getNotifications(userEmail) {
  const sb = supabase();
  const { data, error } = await sb
    .from('notifications')
    .select('*')
    .eq('user_email', userEmail)
    .order('created_at', { ascending: false });
  if (error) { console.error('getNotifications error:', error); return []; }
  return (data || []).map(row => ({
    id: row.id,
    recipient: row.user_email,
    text: row.message || '',
    unread: row.is_read === false,
    timestamp: row.created_at,
  }));
}

export async function addNotification(userEmail, text) {
  const sb = supabase();
  const notif = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user_email: userEmail,
    title: text.substring(0, 50),
    message: text,
    is_read: false
  };
  const { data, error } = await sb.from('notifications').insert([notif]).select().single();
  if (error) console.error('addNotification error:', error.message);
  return data;
}

export async function markNotificationsAsRead(userEmail) {
  const sb = supabase();
  await sb.from('notifications').update({ is_read: true }).eq('user_email', userEmail);
}

export async function getUnreadNotificationsCount(userEmail) {
  const sb = supabase();
  const { count } = await sb
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_email', userEmail)
    .eq('is_read', false);
  return count || 0;
}

// ---- CUSTOMERS ----

export async function getCustomers() {
  const sb = supabase();
  const { data, error } = await sb.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) { console.error('getCustomers error:', error); return []; }
  return data || [];
}

// ---- REVIEWS (static defaults) ----

const DEFAULT_REVIEWS = [
  { id: 'rev-1', customerName: 'John D.', rating: 5, comment: 'Bug Slayers solved my engine stalling issue within 2 hours. Extremely transparent prices!', vehicle: 'Hyundai Creta', verified: true, date: '2026-07-10' },
  { id: 'rev-2', customerName: 'Sarah J.', rating: 5, comment: 'Love the repair approval feature. I only authorized what was critical.', vehicle: 'BMW M3', verified: true, date: '2026-07-15' },
  { id: 'rev-3', customerName: 'Rajesh K.', rating: 5, comment: 'Super convenient pickup and drop-off service. The digital health report was very detailed.', vehicle: 'Honda City', verified: true, date: '2026-07-18' },
  { id: 'rev-4', customerName: 'Priya M.', rating: 5, comment: 'Amazing service! My car looks and runs like brand new. Highly recommended.', vehicle: 'Maruti Baleno', verified: true, date: '2026-07-19' },
];

export async function getReviews() { return DEFAULT_REVIEWS; }

// ---- EMERGENCY REQUESTS ----

export async function getEmergencyRequests() {
  const sb = supabase();
  const { data, error } = await sb.from('emergency_requests').select('*').order('created_at', { ascending: false });
  if (error) { console.error('getEmergencyRequests error:', error); return []; }
  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    location: row.location,
    vehicleDetails: row.vehicle_details,
    breakdownType: row.breakdown_type,
    issue: row.issue,
    towingRequired: row.towing_required,
    status: row.status,
    timestamp: row.created_at,
  }));
}

export async function addEmergencyRequest(req) {
  const sb = supabase();
  const newReq = { 
    id: `em-${Math.floor(100 + Math.random() * 900)}`, 
    name: req.name,
    phone: req.phone,
    location: req.location,
    vehicle_details: req.vehicleDetails,
    breakdown_type: req.breakdownType,
    issue: req.issue,
    towing_required: req.towingRequired,
    status: 'New'
  };
  
  const { error } = await sb.from('emergency_requests').insert([newReq]);
  if (error) console.error('addEmergencyRequest error:', error);
  
  await addNotification('admin', `EMERGENCY: ${req.name} at ${req.location} (${req.phone}).`);
  
  return { ...newReq, vehicleDetails: req.vehicleDetails, breakdownType: req.breakdownType, towingRequired: req.towingRequired, timestamp: new Date().toISOString() };
}

export async function updateEmergencyRequest(id, patch) {
  const sb = supabase();
  const updateData = {};
  if (patch.status) updateData.status = patch.status;
  
  const { data, error } = await sb.from('emergency_requests')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('updateEmergencyRequest error:', error);
    return null;
  }
  
  return {
    ...patch,
    id: data.id,
    status: data.status
  };
}

export async function updateEmergencyStatus(id, status) {
  return updateEmergencyRequest(id, { status });
}

// ---- SAVED VEHICLES (customer_vehicles table) ----

export async function getSavedVehicles(email) {
  const sb = supabase();
  const { data, error } = await sb.from('customer_vehicles').select('*').eq('customer_email', email).order('created_at', { ascending: false });
  if (error) { console.error('getSavedVehicles error:', error); return []; }
  return (data || []).map(row => ({
    make: row.make, model: row.model, year: row.year,
    plateNumber: row.plate_number || row.license_plate,
    fuelType: row.fuel_type, transmission: row.transmission,
    kmReading: row.km_reading || row.mileage,
  }));
}

export async function addSavedVehicle(email, vehicle) {
  const sb = supabase();
  const insert = { customer_email: email, make: vehicle.make, model: vehicle.model, year: vehicle.year, plate_number: vehicle.plateNumber, fuel_type: vehicle.fuelType, transmission: vehicle.transmission, km_reading: vehicle.kmReading };
  const { error } = await sb.from('customer_vehicles').upsert(insert, { onConflict: 'customer_email,plate_number' });
  if (error) console.error('addSavedVehicle error:', error);
  return getSavedVehicles(email);
}

export async function deleteSavedVehicle(email, plateNumber) {
  const sb = supabase();
  await sb.from('customer_vehicles').delete().eq('customer_email', email).eq('plate_number', plateNumber);
  return getSavedVehicles(email);
}

// ---- VEHICLE BRANDS & MODELS (vehicle_brands & vehicle_models tables) ----

const DEFAULT_BRAND_MODELS = {
  "Toyota": ["Fortuner", "Innova Crysta", "Glanza", "Urban Cruiser Hyryder", "Camry"],
  "Hyundai": ["Creta", "Venue", "i20", "Verna", "Alcazar", "Exter"],
  "Honda": ["City", "Amaze", "Elevate", "WR-V"],
  "Maruti Suzuki": ["Swift", "Baleno", "Brezza", "Fronx", "Ertiga", "Grand Vitara"],
  "Tata": ["Nexon", "Punch", "Harrier", "Safari", "Altroz", "Tiago"],
  "Mahindra": ["Scorpio N", "XUV700", "Thar", "Bolero", "XUV 3XO"],
  "Kia": ["Seltos", "Sonet", "Carens", "Syros"],
  "MG": ["Hector", "Astor", "Comet EV", "Gloster", "Windsor EV"],
  "Volkswagen": ["Virtus", "Taigun"],
  "Skoda": ["Slavia", "Kushaq", "Superb"],
  "BMW": ["X1", "X3", "X5", "3 Series", "5 Series"],
  "Mercedes-Benz": ["A-Class", "C-Class", "GLC", "GLE", "E-Class"],
  "Audi": ["A4", "A6", "Q3", "Q5", "Q7"],
  "Renault": ["Kiger", "Triber", "Kwid"],
  "Nissan": ["Magnite", "X-Trail"]
};

export async function getVehicleBrands() {
  const sb = supabase();
  const { data, error } = await sb.from('vehicle_brands').select('*').order('name');
  if (error || !data || data.length === 0) {
    return Object.keys(DEFAULT_BRAND_MODELS).map((b, i) => ({ id: i + 1, name: b }));
  }
  return data;
}

export async function getVehicleModels(brandName) {
  if (!brandName) return [];
  const sb = supabase();
  const { data, error } = await sb.from('vehicle_models').select('*').eq('brand_name', brandName).order('name');
  if (error || !data || data.length === 0) {
    return (DEFAULT_BRAND_MODELS[brandName] || []).map((m, i) => ({ id: i + 1, brand_name: brandName, name: m }));
  }
  return data;
}

export async function addVehicleBrand(name) {
  const sb = supabase();
  const { data, error } = await sb.from('vehicle_brands').insert([{ name }]).select().single();
  if (error) console.error('addVehicleBrand error:', error);
  return data;
}

export async function addVehicleModel(brandName, name) {
  const sb = supabase();
  const { data: brand } = await sb.from('vehicle_brands').select('id').eq('name', brandName).maybeSingle();
  const { data, error } = await sb.from('vehicle_models').insert([{ brand_id: brand?.id || null, brand_name: brandName, name }]).select().single();
  if (error) console.error('addVehicleModel error:', error);
  return data;
}

// ---- SERVICE HISTORY (service_history table) ----

export async function getServiceHistory(email) {
  if (!email) return [];
  const sb = supabase();
  const { data, error } = await sb.from('service_history').select('*').eq('customer_email', email).order('created_at', { ascending: false });
  if (error) { console.error('getServiceHistory error:', error); return []; }
  return (data || []).map(row => ({
    id: row.id,
    bookingId: row.booking_id,
    customerEmail: row.customer_email,
    plateNumber: row.plate_number,
    vehicle: row.vehicle || {},
    serviceName: row.service_name,
    serviceType: row.service_type,
    status: row.status,
    cost: row.cost,
    serviceDate: row.service_date || row.created_at,
  }));
}

export async function addServiceHistory(item) {
  const sb = supabase();
  const insert = {
    booking_id: item.booking_id || item.bookingId || null,
    customer_email: item.customer_email || item.customerEmail,
    plate_number: item.plate_number || item.plateNumber || item.vehicle?.plateNumber || '',
    vehicle: item.vehicle || {},
    service_name: item.service_name || item.serviceName || 'Car Service',
    service_type: item.service_type || item.serviceType || 'Maintenance',
    status: item.status || 'Completed',
    cost: item.cost || 0,
    service_date: item.service_date || new Date().toISOString()
  };
  const { data, error } = await sb.from('service_history').insert([insert]).select().single();
  if (error) console.error('addServiceHistory error:', error);
  return data;
}

// ---- COUPONS (localStorage) ----

const DEFAULT_COUPONS = [
  { code: 'SLAY10', discount: 10, description: '10% off on all services' },
  { code: 'WELCOME15', discount: 15, description: '15% off for new customers' },
];

export function getCoupons() {
  if (typeof window !== 'undefined') {
    try { return JSON.parse(localStorage.getItem('autocare_coupons') || JSON.stringify(DEFAULT_COUPONS)); } catch {}
  }
  return DEFAULT_COUPONS;
}

export function addCoupon(coupon) {
  const coupons = getCoupons(); coupons.push(coupon);
  if (typeof window !== 'undefined') localStorage.setItem('autocare_coupons', JSON.stringify(coupons));
  return coupons;
}

export function deleteCoupon(code) {
  const coupons = getCoupons().filter(c => c.code !== code);
  if (typeof window !== 'undefined') localStorage.setItem('autocare_coupons', JSON.stringify(coupons));
  return coupons;
}

// ---- SLOTS SETTINGS (localStorage) ----

export function getSlotsSettings() {
  if (typeof window !== 'undefined') {
    try { return JSON.parse(localStorage.getItem('autocare_slots') || JSON.stringify({ defaultLimit: 5, blockedDates: [], blockedSlots: {} })); } catch {}
  }
  return { defaultLimit: 5, blockedDates: [], blockedSlots: {} };
}

export function updateSlotsSettings(settings) {
  const updated = { ...getSlotsSettings(), ...settings };
  if (typeof window !== 'undefined') localStorage.setItem('autocare_slots', JSON.stringify(updated));
  return updated;
}

// ---- STATS ----

export async function getStats() {
  const sb = supabase();
  const [bookingsRes, customersRes] = await Promise.all([
    sb.from('bookings').select('*', { count: 'exact', head: true }),
    sb.from('profiles').select('*', { count: 'exact', head: true }),
  ]);
  return { bookings: bookingsRes.count || 0, customers: customersRes.count || 0, reviews: DEFAULT_REVIEWS.length, emergency: 0 };
}

// ---- STATES, DISTRICTS & LOCATIONS ----

const DEFAULT_STATES = [
  { id: 1, name: 'Tamil Nadu' },
  { id: 2, name: 'Karnataka' },
  { id: 3, name: 'Kerala' },
  { id: 4, name: 'Maharashtra' },
  { id: 5, name: 'Telangana' },
  { id: 6, name: 'Andhra Pradesh' },
  { id: 7, name: 'Delhi' },
  { id: 8, name: 'Gujarat' },
];

const DEFAULT_DISTRICTS = {
  1: [
    { id: 101, state_id: 1, name: 'Erode' },
    { id: 102, state_id: 1, name: 'Coimbatore' },
    { id: 103, state_id: 1, name: 'Chennai' },
    { id: 104, state_id: 1, name: 'Salem' },
    { id: 105, state_id: 1, name: 'Madurai' },
    { id: 106, state_id: 1, name: 'Tiruchirappalli' },
    { id: 107, state_id: 1, name: 'Tiruppur' },
    { id: 108, state_id: 1, name: 'Vellore' },
    { id: 109, state_id: 1, name: 'Kanchipuram' },
    { id: 110, state_id: 1, name: 'Thanjavur' },
  ],
  2: [
    { id: 201, state_id: 2, name: 'Bengaluru Urban' },
    { id: 202, state_id: 2, name: 'Mysuru' },
    { id: 203, state_id: 2, name: 'Mangaluru' },
    { id: 204, state_id: 2, name: 'Belagavi' },
    { id: 205, state_id: 2, name: 'Hubballi-Dharwad' },
  ],
  3: [
    { id: 301, state_id: 3, name: 'Ernakulam' },
    { id: 302, state_id: 3, name: 'Thiruvananthapuram' },
    { id: 303, state_id: 3, name: 'Kozhikode' },
    { id: 304, state_id: 3, name: 'Thrissur' },
  ],
  4: [
    { id: 401, state_id: 4, name: 'Mumbai' },
    { id: 402, state_id: 4, name: 'Pune' },
    { id: 403, state_id: 4, name: 'Nagpur' },
    { id: 404, state_id: 4, name: 'Nashik' },
  ],
  5: [
    { id: 501, state_id: 5, name: 'Hyderabad' },
    { id: 502, state_id: 5, name: 'Warangal' },
  ],
  6: [
    { id: 601, state_id: 6, name: 'Visakhapatnam' },
    { id: 602, state_id: 6, name: 'Vijayawada' },
  ],
  7: [
    { id: 701, state_id: 7, name: 'New Delhi' },
    { id: 702, state_id: 7, name: 'North Delhi' },
  ],
  8: [
    { id: 801, state_id: 8, name: 'Ahmedabad' },
    { id: 802, state_id: 8, name: 'Surat' },
  ],
};

const DEFAULT_LOCATIONS = [
  { id: 'erode-1', state_id: 1, district_id: 101, name: 'AutoCare Pro — Erode Central', address: 'Perundurai Road, Near Collectorate, Erode 638011', timing: 'Mon–Sat: 8AM–7PM' },
  { id: 'erode-2', state_id: 1, district_id: 101, name: 'AutoCare Express — Perundurai', address: 'NH-544 Bypass, Perundurai, Erode 638052', timing: 'Mon–Sat: 9AM–6PM' },
  { id: 'cbe-1', state_id: 1, district_id: 102, name: 'AutoCare Pro — Avinashi Road', address: 'Avinashi Rd, Near Hope College, Coimbatore 641004', timing: 'Mon–Sat: 8AM–8PM' },
  { id: 'cbe-2', state_id: 1, district_id: 102, name: 'AutoCare Pro — RS Puram', address: 'DB Road, RS Puram, Coimbatore 641002', timing: 'Mon–Sat: 9AM–7PM' },
  { id: 'che-1', state_id: 1, district_id: 103, name: 'AutoCare Pro — Anna Nagar', address: '2nd Avenue, Anna Nagar, Chennai 600040', timing: 'Mon–Sun: 8AM–8PM' },
  { id: 'blr-1', state_id: 2, district_id: 201, name: 'AutoCare Pro — Koramangala', address: '80 Feet Rd, 4th Block, Koramangala, Bengaluru 560034', timing: 'Mon–Sun: 8AM–8PM' },
  { id: 'mum-1', state_id: 4, district_id: 401, name: 'AutoCare Pro — Andheri West', address: 'Versova Link Rd, Andheri West, Mumbai 400058', timing: 'Mon–Sat: 8AM–7PM' },
  { id: 'mum-2', state_id: 4, district_id: 401, name: 'AutoCare Pro — Bandra East', address: 'Station Rd, Bandra East, Mumbai 400051', timing: 'Mon–Sat: 9AM–6PM' },
  { id: 'pne-1', state_id: 4, district_id: 402, name: 'AutoCare Pro — Baner', address: 'Baner Rd, Near High Street, Pune 411045', timing: 'Mon–Sat: 8AM–8PM' },
  { id: 'del-1', state_id: 7, district_id: 701, name: 'AutoCare Pro — Connaught Place', address: 'Inner Circle, CP, New Delhi 110001', timing: 'Mon–Sat: 8AM–8PM' },
];

export async function getStates() {
  const sb = supabase();
  const { data, error } = await sb.from('states').select('*').order('name');
  if (error || !data || data.length === 0) return DEFAULT_STATES;
  return data;
}

export async function getDistricts(stateId) {
  if (!stateId) return [];
  const sb = supabase();
  const { data, error } = await sb.from('districts').select('*').eq('state_id', stateId).order('name');
  if (error || !data || data.length === 0) {
    const numId = Number(stateId);
    return DEFAULT_DISTRICTS[numId] || [];
  }
  return data;
}

const DEFAULT_AREAS = {
  101: [
    { id: 1001, district_id: 101, name: 'Perundurai Road' },
    { id: 1002, district_id: 101, name: 'Collectorate Area' },
    { id: 1003, district_id: 101, name: 'NH-544 Bypass' },
    { id: 1004, district_id: 101, name: 'Bus Stand Road' },
    { id: 1005, district_id: 101, name: 'Bhavani Road' },
  ],
  102: [
    { id: 1021, district_id: 102, name: 'Avinashi Road / Hope College' },
    { id: 1022, district_id: 102, name: 'RS Puram' },
    { id: 1023, district_id: 102, name: 'Gandhipuram' },
    { id: 1024, district_id: 102, name: 'Peelamedu' },
    { id: 1025, district_id: 102, name: 'Saravanampatti' },
  ],
  103: [
    { id: 1031, district_id: 103, name: 'Anna Nagar' },
    { id: 1032, district_id: 103, name: 'OMR Guindy' },
    { id: 1033, district_id: 103, name: 'T. Nagar' },
    { id: 1034, district_id: 103, name: 'Velachery' },
  ],
  201: [
    { id: 2011, district_id: 201, name: 'Koramangala' },
    { id: 2012, district_id: 201, name: 'Indiranagar' },
    { id: 2013, district_id: 201, name: 'Whitefield' },
    { id: 2014, district_id: 201, name: 'HSR Layout' },
  ],
  401: [
    { id: 4011, district_id: 401, name: 'Andheri West' },
    { id: 4012, district_id: 401, name: 'Bandra East' },
    { id: 4013, district_id: 401, name: 'Powai' },
  ],
};

export async function getAreas(districtId) {
  if (!districtId) return [];
  const sb = supabase();
  const { data, error } = await sb.from('areas').select('*').eq('district_id', districtId).order('name');
  if (error || !data || data.length === 0) {
    const numId = Number(districtId);
    return DEFAULT_AREAS[numId] || [
      { id: numId * 10 + 1, district_id: numId, name: 'Central Town Area' },
      { id: numId * 10 + 2, district_id: numId, name: 'Bypass / Main Road' },
      { id: numId * 10 + 3, district_id: numId, name: 'Industrial Hub Area' },
    ];
  }
  return data;
}

export async function getLocations(stateId, districtId) {
  const sb = supabase();
  let query = sb.from('locations').select('*');
  if (stateId) query = query.eq('state_id', stateId);
  if (districtId) query = query.eq('district_id', districtId);
  const { data, error } = await query.order('name');
  if (error || !data || data.length === 0) {
    return DEFAULT_LOCATIONS.filter(loc => {
      if (stateId && String(loc.state_id) !== String(stateId)) return false;
      if (districtId && String(loc.district_id) !== String(districtId)) return false;
      return true;
    });
  }
  return data;
}
