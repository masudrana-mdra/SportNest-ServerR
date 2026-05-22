const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Initialize app
const app = express();

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',').map(o => o.trim()) 
    : ['http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy: Origin not allowed.'));
        }
    },
    credentials: true, // Allow cookies
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/facilities', require('./routes/facilityRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Basic health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'SportNest Dual Backend API is running' });
});

module.exports = app;
