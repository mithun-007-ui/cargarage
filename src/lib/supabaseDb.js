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
