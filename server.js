require('dotenv').config();

// Fail-fast environment variable validation
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.error(`ERROR: Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

// Uncaught Exception Handler
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err.name, err.message);
    console.error(err.stack);
    process.exit(1);
});

const app = require('./app');
const connectDB = require('./database/connection');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
let server;
const startServer = async () => {
    try {
        await connectDB();
        server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();

// Unhandled Rejection Handler
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...', err.name, err.message);
    console.error(err.stack);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});
