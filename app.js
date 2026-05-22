const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Initialize app
const app = express();

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',').map(o => o.trim()) 
    : ['https://sportnest-client-coral.vercel.app'];

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

// Security and Performance Middlewares
app.use(helmet());
app.use(compression());
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, 
    legacyHeaders: false, 
});
// Apply rate limiter to all API routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/facilities', require('./routes/facilityRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Basic health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'SportNest Dual Backend API is running' });
});

// Global Error Handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
