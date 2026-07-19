const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory mock database for Phase 1 backend representation
let bookings = [];

// Base API route
app.get('/', (req, res) => {
  res.json({ message: 'Vehicle Service Management Platform API is running.' });
});

// Mock Auth endpoint (for future transition)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'user@gmail.com' && password === 'user123') {
    return res.json({
      success: true,
      user: { email, name: 'User', role: 'User' },
      token: 'mock-user-jwt-token'
    });
  } else if (email === 'admin@gmail.com' && password === 'admin123') {
    return res.json({
      success: true,
      user: { email, name: 'Admin', role: 'Admin' },
      token: 'mock-admin-jwt-token'
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid email or password' });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[ERROR] Port ${PORT} is already in use.`);
    console.error(`Another process is already running on this port. Please kill that process or edit the PORT variable in a .env file.\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});
