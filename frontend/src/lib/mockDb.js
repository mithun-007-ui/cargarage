// Mock database synced with localStorage for frontend-only state persistence
// Handles Next.js SSR gracefully by verifying if window is defined.

const DEFAULT_SERVICES = [
  { id: 'general-maintenance', name: 'General Maintenance', icon: 'Wrench', description: 'Comprehensive inspect, lube, and diagnostic checkup.', price: 120 },
  { id: 'oil-change', name: 'Oil Change', icon: 'Droplet', description: 'Full engine oil flush, high-grade synthetic oil replacement, and new filter.', price: 79 },
  { id: 'brake-service', name: 'Brake Service', icon: 'ShieldAlert', description: 'Front & rear pad inspections, caliper servicing, and brake fluid top-up.', price: 149 },
  { id: 'ac-service', name: 'AC Service', icon: 'Wind', description: 'Refrigerant recharge, cabin leak test, and filter clean.', price: 99 },
  { id: 'battery-service', name: 'Battery Service', icon: 'BatteryCharging', description: 'Battery charge state diagnostic, terminal cleanup, and replacement if needed.', price: 49 },
  { id: 'tyre-service', name: 'Tyre Service', icon: 'Disc', description: 'Tyre rotation, balance checking, pressure calibration, and alignment scan.', price: 59 }
];

const DEFAULT_PACKAGES = [
  {
    id: 'silver-care',
    name: 'Silver Care',
    price: 149,
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
    price: 249,
    description: 'Complete yearly maintenance and protection.',
    features: [
      'All Silver Care features',
      'Full Tyre Rotation & Balancings',
      'Air & Cabin Filter Replacement',
      'Spark Plug Integrity Check',
      'Brake System Service & Cleaning',
      'AC Efficiency Diagnostic'
    ]
  },
  {
    id: 'platinum-care',
    name: 'Platinum Care',
    price: 399,
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
    vehicle: { make: 'Tesla', model: 'Model Y', year: '2022', plateNumber: 'CA-888-XX' },
    serviceType: 'Oil Change',
    packageSelected: 'Silver Care',
    estimatedPrice: 228, // Oil change ($79) + Silver Care ($149)
    date: '2026-07-19',
    time: '10:00 AM',
    status: 'Booked',
    healthReport: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bk-1002',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    vehicle: { make: 'BMW', model: 'M3', year: '2021', plateNumber: 'NY-777-YY' },
    serviceType: 'Brake Service',
    packageSelected: 'None',
    estimatedPrice: 149,
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
    vehicle: { make: 'Ford', model: 'F-150', year: '2019', plateNumber: 'TX-444-ZZ' },
    serviceType: 'General Maintenance',
    packageSelected: 'Gold Care',
    estimatedPrice: 369, // 120 + 249
    date: '2026-07-18',
    time: '09:00 AM',
    status: 'Waiting for Approval',
    healthReport: {
      inspectedAt: new Date().toISOString(),
      notes: 'Brake pads are severely worn down. Front rotors have heat spots and need replacing.',
      items: [
        { name: 'Front Brake Pads Replacement', cost: 180, approved: null },
        { name: 'Front Rotors Replacement', cost: 220, approved: null },
        { name: 'Cabin Air Filter Replacement', cost: 45, approved: null }
      ]
    },
    createdAt: new Date().toISOString()
  }
];

// Helper to check if window / localStorage is available
const isClient = () => typeof window !== 'undefined';

export const getMockDb = () => {
  if (!isClient()) {
    return {
      services: DEFAULT_SERVICES,
      packages: DEFAULT_PACKAGES,
      bookings: INITIAL_BOOKINGS
    };
  }

  let db = localStorage.getItem('autocare_db');
  if (!db) {
    const initialDb = {
      services: DEFAULT_SERVICES,
      packages: DEFAULT_PACKAGES,
      bookings: INITIAL_BOOKINGS
    };
    localStorage.setItem('autocare_db', JSON.stringify(initialDb));
    return initialDb;
  }
  try {
    return JSON.parse(db);
  } catch (e) {
    console.error('Error parsing mock DB, resetting...', e);
    const initialDb = {
      services: DEFAULT_SERVICES,
      packages: DEFAULT_PACKAGES,
      bookings: INITIAL_BOOKINGS
    };
    localStorage.setItem('autocare_db', JSON.stringify(initialDb));
    return initialDb;
  }
};

const saveMockDb = (db) => {
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

export const addBooking = (booking) => {
  const db = getMockDb();
  const newBooking = {
    ...booking,
    id: `bk-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Booked',
    healthReport: null,
    createdAt: new Date().toISOString()
  };
  db.bookings.unshift(newBooking); // Add to the top
  saveMockDb(db);
  return newBooking;
};

export const updateBookingStatus = (id, status) => {
  const db = getMockDb();
  const index = db.bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    db.bookings[index].status = status;
    saveMockDb(db);
    return db.bookings[index];
  }
  return null;
};

export const addHealthReport = (id, notes, items) => {
  const db = getMockDb();
  const index = db.bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    db.bookings[index].healthReport = {
      inspectedAt: new Date().toISOString(),
      notes,
      items: items.map(item => ({
        ...item,
        approved: null // null = pending response, true = approved, false = rejected
      }))
    };
    db.bookings[index].status = 'Waiting for Approval';
    saveMockDb(db);
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
      db.bookings[index].status = 'Repair in Progress';
    }
    
    saveMockDb(db);
    return db.bookings[index];
  }
  return null;
};

export const resetDb = () => {
  if (isClient()) {
    const initialDb = {
      services: DEFAULT_SERVICES,
      packages: DEFAULT_PACKAGES,
      bookings: INITIAL_BOOKINGS
    };
    localStorage.setItem('autocare_db', JSON.stringify(initialDb));
    return initialDb;
  }
};
