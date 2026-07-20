// Mock database synced with localStorage for frontend-only state persistence
// Handles Next.js SSR gracefully by verifying if window is defined.

const DEFAULT_SERVICES = [
  { id: 'general-maintenance', name: 'General Service', icon: 'Wrench', description: 'Comprehensive inspect, lube, and diagnostic checkup.', price: 1200, duration: 120 },
  { id: 'oil-change', name: 'Oil Change', icon: 'Droplet', description: 'Full engine oil flush, high-grade synthetic oil replacement, and new filter.', price: 799, duration: 45 },
  { id: 'brake-service', name: 'Brake Service', icon: 'ShieldAlert', description: 'Front & rear pad inspections, caliper servicing, and brake fluid top-up.', price: 1499, duration: 90 },
  { id: 'ac-service', name: 'AC Service', icon: 'Wind', description: 'Refrigerant recharge, cabin leak test, and filter clean.', price: 999, duration: 60 },
  { id: 'battery-replacement', name: 'Battery Replacement', icon: 'BatteryCharging', description: 'Battery diagnostic, terminal cleanup, and replacement with genuine parts.', price: 2999, duration: 45 },
  { id: 'wheel-alignment', name: 'Wheel Alignment', icon: 'Disc', description: 'Precision wheel alignment, tyre rotation, balance checking, and calibration.', price: 799, duration: 60 },
  { id: 'tyre-replacement', name: 'Tyre Replacement', icon: 'Circle', description: 'Premium tyre fitting and balancing for all vehicle types.', price: 3500, duration: 90 },
  { id: 'engine-diagnosis', name: 'Engine Diagnosis', icon: 'Cpu', description: 'OBD-II scan, fault code reading, and engine performance diagnostics.', price: 899, duration: 60 },
  { id: 'car-wash', name: 'Car Wash', icon: 'Sparkles', description: 'Complete exterior foam wash, rinse, and dry with tyre dressing.', price: 299, duration: 30 },
  { id: 'interior-cleaning', name: 'Interior Cleaning', icon: 'Sofa', description: 'Deep vacuum, dashboard polish, seat cleaning, and fragrance treatment.', price: 599, duration: 60 },
  { id: 'exterior-polishing', name: 'Exterior Polishing', icon: 'Star', description: 'Machine polish, wax coating, and paint protection for lasting shine.', price: 1499, duration: 90 },
  { id: 'suspension-check', name: 'Suspension Check', icon: 'ArrowUpDown', description: 'Shock absorber test, spring inspection, and steering linkage check.', price: 699, duration: 45 },
  { id: 'coolant-replacement', name: 'Coolant Replacement', icon: 'Thermometer', description: 'Full coolant drain, system flush, and refill with anti-freeze mix.', price: 599, duration: 40 },
  { id: 'air-filter-replacement', name: 'Air Filter Replacement', icon: 'Fan', description: 'Engine and cabin air filter inspection and replacement.', price: 399, duration: 20 },
  { id: 'spark-plug-replacement', name: 'Spark Plug Replacement', icon: 'Zap', description: 'Spark plug inspection, gap adjustment, and replacement for smoother ignition.', price: 499, duration: 30 },
];


const DEFAULT_PACKAGES = [
  {
    id: 'silver-care',
    name: 'Silver Care',
    price: 1499,
    description: 'Essential maintenance pack for city drivers.',
    features: [
      'Synthetic Oil & Filter Change',
      '24-Point Health Inspection',
      'Fluid Top-up (Brakes, Coolant, Windshield)',
      'Tyre Pressure & Wear Check',
      'Battery Diagnostic Test'
    ]
  },
  {
    id: 'gold-care',
    name: 'Gold Care',
    price: 2499,
    description: 'Complete yearly maintenance and protection.',
    features: [
      'All Silver Care features',
      'Full Tyre Rotation & Balancing',
      'Air & Cabin Filter Replacement',
      'Spark Plug Integrity Check',
      'Brake System Service & Cleaning',
      'AC Efficiency Diagnostic'
    ]
  },
  {
    id: 'platinum-care',
    name: 'Platinum Care',
    price: 3999,
    description: 'Ultimate detailing, protection, and priority service.',
    features: [
      'All Gold Care features',
      'Engine Flush & Carbon Cleaning',
      'Fuel Injector Cleaning service',
      'Wiper Blade Replacement',
      'Wheel Alignment Adjustments',
      'Priority Lounge Access & Free Towing (1 Year)',
      'Complete Interior & Exterior Wash'
    ]
  }
];

const INITIAL_BOOKINGS = [
  {
    id: 'bk-1001',
    customerName: 'John Doe',
    customerEmail: 'user@gmail.com',
    vehicle: {
      make: 'Hyundai',
      model: 'Creta',
      year: '2022',
      plateNumber: 'MH-12-AB-1234',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      kmReading: '28000'
    },
    serviceType: 'Oil Change',
    selectedServices: [
      { id: 'oil-change', name: 'Oil Change', price: 799 },
      { id: 'battery-check', name: 'Battery Check', price: 499 }
    ],
    packageSelected: 'Silver Care',
    packagePrice: 1499,
    estimatedPrice: 2797,
    serviceCenter: 'AutoCare Pro - Andheri West',
    pickupOption: 'Drop-off',
    date: '2026-07-20',
    time: '10:00 AM',
    status: 'Booked',
    healthReport: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bk-1002',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    vehicle: {
      make: 'BMW',
      model: 'M3',
      year: '2021',
      plateNumber: 'DL-01-CX-9876',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      kmReading: '15000'
    },
    serviceType: 'Brake Service',
    selectedServices: [
      { id: 'brake-service', name: 'Brake Service', price: 1499 }
    ],
    packageSelected: 'None',
    packagePrice: 0,
    estimatedPrice: 1499,
    serviceCenter: 'AutoCare Pro - Bandra East',
    pickupOption: 'Pickup & Delivery',
    date: '2026-07-19',
    time: '02:00 PM',
    status: 'Vehicle Received',
    healthReport: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bk-1003',
    customerName: 'Michael Chang',
    customerEmail: 'm.chang@example.com',
    vehicle: {
      make: 'Maruti Suzuki',
      model: 'Brezza',
      year: '2020',
      plateNumber: 'KA-05-MN-3344',
      fuelType: 'Diesel',
      transmission: 'Manual',
      kmReading: '55000'
    },
    serviceType: 'General Maintenance',
    selectedServices: [
      { id: 'general-maintenance', name: 'General Service', price: 1200 },
      { id: 'brake-service', name: 'Brake Service', price: 1499 },
      { id: 'ac-service', name: 'AC Service', price: 999 }
    ],
    packageSelected: 'Gold Care',
    packagePrice: 2499,
    estimatedPrice: 6197,
    serviceCenter: 'AutoCare Pro - Powai',
    pickupOption: 'Drop-off',
    date: '2026-07-18',
    time: '09:00 AM',
    status: 'Waiting for Approval',
    healthReport: {
      inspectedAt: new Date().toISOString(),
      notes: 'Brake pads are severely worn down. Front rotors have heat spots and need replacing. AC gas is critically low affecting cooling efficiency.',
      healthScore: 68,
      reportSent: true,
      components: {
        engine: 'Good',
        brakes: 'Worn Out',
        battery: 'Healthy',
        tyres: 'Need Replacement',
        suspension: 'Good',
        ac: 'Gas Low'
      },
      items: [
        { name: 'Front Brake Pad Replacement', cost: 3500, approved: null, priority: 'High', description: 'Brake pads worn below 3mm threshold — critical safety issue.' },
        { name: 'AC Gas Refill', cost: 1800, approved: null, priority: 'Medium', description: 'Refrigerant at 20% capacity. Needs full recharge for effective cooling.' },
        { name: 'Tyre Replacement (All 4)', cost: 8500, approved: null, priority: 'High', description: 'All 4 tyres show tread depth below 2mm. Replacement recommended.' }
      ]
    },
    createdAt: new Date().toISOString()
  }
];

// Helper to check if window / localStorage is available
const isClient = () => typeof window !== 'undefined';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'nt-1001',
    recipient: 'user@gmail.com',
    text: 'Booking confirmed for your Hyundai Creta (MH-12-AB-1234).',
    unread: true,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
  },
  {
    id: 'nt-1002',
    recipient: 'admin@gmail.com',
    text: 'New booking received: Booking ID bk-1001 for Hyundai Creta.',
    unread: true,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'nt-1003',
    recipient: 'user@gmail.com',
    text: 'Your BMW M3 check-in at Bandra East branch was complete.',
    unread: false,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
  }
];

export const getMockDb = () => {
  if (!isClient()) {
    return {
      services: DEFAULT_SERVICES,
      packages: DEFAULT_PACKAGES,
      bookings: INITIAL_BOOKINGS,
      notifications: INITIAL_NOTIFICATIONS,
      coupons: [],
      reviews: [],
      emergencyRequests: [],
      savedVehicles: {},
      slotsSettings: { defaultLimit: 5, blockedDates: [], blockedSlots: {} }
    };
  }

  let db = localStorage.getItem('autocare_db');
  if (!db) {
    const initialDb = {
      services: DEFAULT_SERVICES,
      packages: DEFAULT_PACKAGES,
      bookings: INITIAL_BOOKINGS,
      notifications: INITIAL_NOTIFICATIONS,
      coupons: [
        { code: 'SLAY10', discount: 10, description: '10% off on all services' },
        { code: 'WELCOME15', discount: 15, description: '15% off for new customers' }
      ],
      reviews: [
        { id: 'rev-1', customerName: 'John D.', rating: 5, comment: 'Bug Slayers solved my engine stalling issue within 2 hours. Extremely transparent prices!', vehicle: 'Hyundai Creta', verified: true, date: '2026-07-10' },
        { id: 'rev-2', customerName: 'Sarah J.', rating: 5, comment: 'Love the repair approval feature. I only authorized what was critical.', vehicle: 'BMW M3', verified: true, date: '2026-07-15' },
        { id: 'rev-3', customerName: 'Rajesh K.', rating: 5, comment: 'Super convenient pickup and drop-off service. The digital health report was very detailed.', vehicle: 'Honda City', verified: true, date: '2026-07-18' },
      ],
      emergencyRequests: [
        { id: 'em-101', name: 'Alok Mishra', phone: '9876543211', issue: 'Engine Overheating', location: 'Avinashi Road, Coimbatore', status: 'New', timestamp: new Date().toISOString() }
      ],
      savedVehicles: {},
      slotsSettings: { defaultLimit: 5, blockedDates: [], blockedSlots: {} },
      version: 3
    };
    localStorage.setItem('autocare_db', JSON.stringify(initialDb));
    return initialDb;
  }
  try {
    const parsed = JSON.parse(db);
    // Version bump: ensure we have version 3 tables
    if (!parsed.version || parsed.version < 3) {
      parsed.notifications = parsed.notifications || INITIAL_NOTIFICATIONS;
      parsed.services = DEFAULT_SERVICES;
      parsed.packages = DEFAULT_PACKAGES;
      parsed.coupons = [
        { code: 'SLAY10', discount: 10, description: '10% off on all services' },
        { code: 'WELCOME15', discount: 15, description: '15% off for new customers' }
      ];
      parsed.reviews = [
        { id: 'rev-1', customerName: 'John D.', rating: 5, comment: 'Bug Slayers solved my engine stalling issue within 2 hours. Extremely transparent prices!', vehicle: 'Hyundai Creta', verified: true, date: '2026-07-10' },
        { id: 'rev-2', customerName: 'Sarah J.', rating: 5, comment: 'Love the repair approval feature. I only authorized what was critical.', vehicle: 'BMW M3', verified: true, date: '2026-07-15' },
        { id: 'rev-3', customerName: 'Rajesh K.', rating: 5, comment: 'Super convenient pickup and drop-off service. The digital health report was very detailed.', vehicle: 'Honda City', verified: true, date: '2026-07-18' },
      ];
      parsed.emergencyRequests = [
        { id: 'em-101', name: 'Alok Mishra', phone: '9876543211', issue: 'Engine Overheating', location: 'Avinashi Road, Coimbatore', status: 'New', timestamp: new Date().toISOString() }
      ];
      parsed.savedVehicles = parsed.savedVehicles || {};
      parsed.slotsSettings = parsed.slotsSettings || { defaultLimit: 5, blockedDates: [], blockedSlots: {} };
      parsed.version = 3;
      localStorage.setItem('autocare_db', JSON.stringify(parsed));
    }
    return parsed;

  } catch (e) {
    console.error('Error parsing mock DB, resetting...', e);
    const initialDb = {
      services: DEFAULT_SERVICES,
      packages: DEFAULT_PACKAGES,
      bookings: INITIAL_BOOKINGS,
      notifications: INITIAL_NOTIFICATIONS,
      coupons: [
        { code: 'SLAY10', discount: 10, description: '10% off on all services' },
        { code: 'WELCOME15', discount: 15, description: '15% off for new customers' }
      ],
      reviews: [
        { id: 'rev-1', customerName: 'John D.', rating: 5, comment: 'Bug Slayers solved my engine stalling issue within 2 hours. Extremely transparent prices!', vehicle: 'Hyundai Creta', verified: true, date: '2026-07-10' },
        { id: 'rev-2', customerName: 'Sarah J.', rating: 5, comment: 'Love the repair approval feature. I only authorized what was critical.', vehicle: 'BMW M3', verified: true, date: '2026-07-15' },
      ],
      emergencyRequests: [
        { id: 'em-101', name: 'Alok Mishra', phone: '9876543211', issue: 'Engine Overheating', location: 'Avinashi Road, Coimbatore', status: 'New', timestamp: new Date().toISOString() }
      ],
      savedVehicles: {},
      slotsSettings: { defaultLimit: 5, blockedDates: [], blockedSlots: {} },
      version: 3
    };
    localStorage.setItem('autocare_db', JSON.stringify(initialDb));
    return initialDb;
  }
};

export const saveMockDb = (db) => {
  if (isClient()) {
    localStorage.setItem('autocare_db', JSON.stringify(db));
  }
};

export const getBookings = () => {
  return getMockDb().bookings;
};

export const getBookingById = (id) => {
  return getMockDb().bookings.find(b => b.id === id);
};

// Notification Helpers
export const getNotifications = (recipient) => {
  const db = getMockDb();
  if (!db.notifications) return [];
  return db.notifications.filter(n => n.recipient.toLowerCase() === recipient.toLowerCase());
};

export const addNotification = (recipient, text) => {
  const db = getMockDb();
  if (!db.notifications) db.notifications = [];
  const newNotif = {
    id: `nt-${Math.floor(1000 + Math.random() * 9000)}`,
    recipient,
    text,
    unread: true,
    timestamp: new Date().toISOString()
  };
  db.notifications.unshift(newNotif);
  saveMockDb(db);
  return newNotif;
};

export const markNotificationsAsRead = (recipient) => {
  const db = getMockDb();
  if (!db.notifications) return;
  db.notifications.forEach(n => {
    if (n.recipient.toLowerCase() === recipient.toLowerCase()) {
      n.unread = false;
    }
  });
  saveMockDb(db);
};

export const getUnreadNotificationsCount = (recipient) => {
  const db = getMockDb();
  if (!db.notifications) return 0;
  return db.notifications.filter(n => n.recipient.toLowerCase() === recipient.toLowerCase() && n.unread).length;
};

export const addBooking = (booking) => {
  const db = getMockDb();
  const newBooking = {
    ...booking,
    id: `bk-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Booked',
    healthReport: null,
    technicianAssigned: null,
    createdAt: new Date().toISOString()
  };
  db.bookings.unshift(newBooking); // Add to the top
  saveMockDb(db);
  
  // Add notifications
  addNotification(booking.customerEmail, `Booking Confirmed: Your booking ID is ${newBooking.id}.`);
  addNotification('admin@gmail.com', `New Booking: Customer ${booking.customerName} scheduled a service (ID: ${newBooking.id}).`);
  
  return newBooking;
};

export const updateBookingStatus = (id, status) => {
  const db = getMockDb();
  const index = db.bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    const booking = db.bookings[index];
    booking.status = status;
    saveMockDb(db);

    // Dynamic notifications based on status changes
    if (status === 'Vehicle Received') {
      addNotification(booking.customerEmail, `Vehicle Received: Your ${booking.vehicle.make} ${booking.vehicle.model} has been checked in.`);
      addNotification('admin@gmail.com', `Vehicle Checked In: Booking ${id} is ready for assignment.`);
    } else if (status === 'Inspection' || status === 'Inspection Started') {
      addNotification(booking.customerEmail, `Inspection Started: A technician is now running diagnostics on your vehicle.`);
      addNotification('admin@gmail.com', `Service Started: Inspection has begun for Booking ${id}.`);
    } else if (status === 'Inspection Completed') {
      addNotification(booking.customerEmail, `Inspection Completed: Diagnostic reports have been drafted. Awaiting report release.`);
      addNotification('admin@gmail.com', `Report Drafted: Inspection report is ready for Booking ${id}.`);
    } else if (status === 'Waiting for Approval' || status === 'Approval Required') {
      addNotification(booking.customerEmail, `Repair Approval Requested: Please review and approve the recommended repairs.`);
      addNotification('admin@gmail.com', `Approval Request Sent: Invoice recommendations issued for Booking ${id}.`);
    } else if (status === 'Service in Progress' || status === 'Repair Started') {
      addNotification(booking.customerEmail, `Repair Started: Our team has begun work on the authorized repairs.`);
      addNotification('admin@gmail.com', `Repairs In Progress: Active service underway for Booking ${id}.`);
    } else if (status === 'Quality Check') {
      addNotification(booking.customerEmail, `Quality Check: Servicing complete. Your vehicle is entering final verification inspections.`);
      addNotification('admin@gmail.com', `Quality Control: Checking parameters for Booking ${id}.`);
    } else if (status === 'Ready for Pickup' || status === 'Ready for Delivery') {
      addNotification(booking.customerEmail, `Vehicle Ready for Pickup: All inspections and repairs have been completed successfully.`);
      addNotification('admin@gmail.com', `Service Ready: Booking ${id} is complete and awaiting collection.`);
    } else if (status === 'Completed' || status === 'Delivered') {
      addNotification(booking.customerEmail, `Vehicle Delivered: Service completed. We hope you liked our premium workflow!`);
      addNotification('admin@gmail.com', `Service Completed: Booking ${id} has been delivered.`);
    }

    return booking;
  }
  return null;
};

export const assignTechnician = (id, technicianName) => {
  const db = getMockDb();
  const index = db.bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    db.bookings[index].technicianAssigned = technicianName;
    db.bookings[index].status = 'Inspection Started';
    saveMockDb(db);
    
    addNotification(db.bookings[index].customerEmail, `Technician Assigned: ${technicianName} is performing the inspection.`);
    addNotification('admin@gmail.com', `Assignment Complete: ${technicianName} was assigned to Booking ${id}.`);
    return db.bookings[index];
  }
  return null;
};

export const sendReportToCustomer = (id) => {
  const db = getMockDb();
  const index = db.bookings.findIndex(b => b.id === id);
  if (index !== -1 && db.bookings[index].healthReport) {
    db.bookings[index].healthReport.reportSent = true;
    db.bookings[index].status = 'Waiting for Approval';
    saveMockDb(db);

    addNotification(db.bookings[index].customerEmail, `Your vehicle inspection has been completed. Please review and approve the recommended repairs.`);
    addNotification('admin@gmail.com', `Sent to Customer: Inspection report released for Booking ${id}.`);
    return db.bookings[index];
  }
  return null;
};

export const addHealthReport = (id, notes, items, healthScore, components) => {
  const db = getMockDb();
  const index = db.bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    db.bookings[index].healthReport = {
      inspectedAt: new Date().toISOString(),
      notes,
      healthScore: healthScore || 85,
      reportSent: false, // NOT sent to customer automatically
      components: components || {
        engine: 'Good',
        brakes: 'Good',
        battery: 'Good',
        tyres: 'Good',
        suspension: 'Good',
        ac: 'Good'
      },
      items: items.map(item => ({
        ...item,
        approved: null // null = pending response, true = approved, false = rejected
      }))
    };
    db.bookings[index].status = 'Inspection Completed';
    saveMockDb(db);
    
    addNotification('admin@gmail.com', `Inspection Finished: Report generated for Booking ${id}. Awaiting release.`);
    return db.bookings[index];
  }
  return null;
};

export const updateHealthReportItem = (bookingId, itemIndex, approved) => {
  const db = getMockDb();
  const index = db.bookings.findIndex(b => b.id === bookingId);
  if (index !== -1 && db.bookings[index].healthReport) {
    db.bookings[index].healthReport.items[itemIndex].approved = approved;
    
    // Check if all items are acted upon (either approved or rejected)
    const allReviewed = db.bookings[index].healthReport.items.every(item => item.approved !== null);
    if (allReviewed) {
      db.bookings[index].status = 'Customer Approved Repairs';
      
      const approvedCount = db.bookings[index].healthReport.items.filter(item => item.approved).length;
      const rejectedCount = db.bookings[index].healthReport.items.filter(item => !item.approved).length;
      
      addNotification('admin@gmail.com', `Customer Decided: Booking ${bookingId} has ${approvedCount} approved, ${rejectedCount} rejected repairs.`);
      addNotification(db.bookings[index].customerEmail, `Your decisions have been submitted. ${approvedCount} approved, ${rejectedCount} rejected.`);
    }
    
    saveMockDb(db);
    return db.bookings[index];
  }
  return null;
};

// ─── Coupons ───
export const getCoupons = () => {
  return getMockDb().coupons || [];
};
export const addCoupon = (coupon) => {
  const db = getMockDb();
  db.coupons = db.coupons || [];
  db.coupons.push(coupon);
  saveMockDb(db);
  return db.coupons;
};
export const deleteCoupon = (code) => {
  const db = getMockDb();
  db.coupons = (db.coupons || []).filter(c => c.code !== code);
  saveMockDb(db);
  return db.coupons;
};

// ─── Reviews ───
export const getReviews = () => {
  return getMockDb().reviews || [];
};
export const addReview = (review) => {
  const db = getMockDb();
  db.reviews = db.reviews || [];
  const newReview = {
    id: `rev-${Date.now()}`,
    ...review,
    verified: true,
    date: new Date().toISOString().split('T')[0]
  };
  db.reviews.unshift(newReview);
  saveMockDb(db);
  return newReview;
};

// ─── Emergency Requests ───
export const getEmergencyRequests = () => {
  return getMockDb().emergencyRequests || [];
};
export const addEmergencyRequest = (req) => {
  const db = getMockDb();
  db.emergencyRequests = db.emergencyRequests || [];
  const newReq = {
    id: `em-${Math.floor(100 + Math.random() * 900)}`,
    status: 'New',
    timestamp: new Date().toISOString(),
    ...req
  };
  db.emergencyRequests.unshift(newReq);
  saveMockDb(db);
  
  addNotification('admin@gmail.com', `🚨 EMERGENCY HELP REQUESTED: ${req.name} at ${req.location} (${req.phone}).`);
  return newReq;
};
export const updateEmergencyStatus = (id, status) => {
  const db = getMockDb();
  db.emergencyRequests = db.emergencyRequests || [];
  const idx = db.emergencyRequests.findIndex(r => r.id === id);
  if (idx !== -1) {
    db.emergencyRequests[idx].status = status;
    saveMockDb(db);
    return db.emergencyRequests[idx];
  }
  return null;
};

// ─── Saved Vehicles ───
export const getSavedVehicles = (email) => {
  const db = getMockDb();
  if (!db.savedVehicles) return [];
  return db.savedVehicles[email.toLowerCase()] || [];
};
export const addSavedVehicle = (email, vehicle) => {
  const db = getMockDb();
  db.savedVehicles = db.savedVehicles || {};
  const emailKey = email.toLowerCase();
  if (!db.savedVehicles[emailKey]) db.savedVehicles[emailKey] = [];
  
  // Prevent duplicate plate numbers
  db.savedVehicles[emailKey] = db.savedVehicles[emailKey].filter(v => v.plateNumber !== vehicle.plateNumber);
  db.savedVehicles[emailKey].push(vehicle);
  saveMockDb(db);
  return db.savedVehicles[emailKey];
};
export const deleteSavedVehicle = (email, plateNumber) => {
  const db = getMockDb();
  db.savedVehicles = db.savedVehicles || {};
  const emailKey = email.toLowerCase();
  if (db.savedVehicles[emailKey]) {
    db.savedVehicles[emailKey] = db.savedVehicles[emailKey].filter(v => v.plateNumber !== plateNumber);
    saveMockDb(db);
  }
  return db.savedVehicles[emailKey] || [];
};

export const updateBookingDateTime = (id, date, time) => {
  const db = getMockDb();
  const idx = db.bookings.findIndex(b => b.id === id);
  if (idx !== -1) {
    db.bookings[idx].date = date;
    db.bookings[idx].time = time;
    saveMockDb(db);
    return db.bookings[idx];
  }
  return null;
};

// ─── Slots Settings ───
export const getSlotsSettings = () => {
  const db = getMockDb();
  if (!db.slotsSettings) {
    return { defaultLimit: 5, blockedDates: [], blockedSlots: {} };
  }
  return db.slotsSettings;
};
export const updateSlotsSettings = (settings) => {
  const db = getMockDb();
  db.slotsSettings = { ...getSlotsSettings(), ...settings };
  saveMockDb(db);
  return db.slotsSettings;
};

export const resetDb = () => {
  if (isClient()) {
    const initialDb = {
      services: DEFAULT_SERVICES,
      packages: DEFAULT_PACKAGES,
      bookings: INITIAL_BOOKINGS,
      notifications: INITIAL_NOTIFICATIONS,
      coupons: [
        { code: 'SLAY10', discount: 10, description: '10% off on all services' },
        { code: 'WELCOME15', discount: 15, description: '15% off for new customers' }
      ],
      reviews: [
        { id: 'rev-1', customerName: 'John D.', rating: 5, comment: 'Bug Slayers solved my engine stalling issue within 2 hours. Transparent pricing at its best.', vehicle: 'Hyundai Creta', verified: true, date: '2026-07-10' },
        { id: 'rev-2', customerName: 'Sarah J.', rating: 5, comment: 'Love the repair approval feature. I only authorized what was critical.', vehicle: 'BMW M3', verified: true, date: '2026-07-15' },
        { id: 'rev-3', customerName: 'Rajesh K.', rating: 5, comment: 'Super convenient pickup and drop-off service. The digital health report was very detailed.', vehicle: 'Honda City', verified: true, date: '2026-07-18' },
      ],
      emergencyRequests: [
        { id: 'em-101', name: 'Alok Mishra', phone: '9876543211', issue: 'Engine Overheating', location: 'Avinashi Road, Coimbatore', status: 'New', timestamp: new Date().toISOString() }
      ],
      savedVehicles: {},
      slotsSettings: { defaultLimit: 5, blockedDates: [], blockedSlots: {} },
      version: 3
    };
    localStorage.setItem('autocare_db', JSON.stringify(initialDb));
    return initialDb;
  }
};
