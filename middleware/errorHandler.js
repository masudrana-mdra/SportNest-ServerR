const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error for internal tracking

    const statusCode = err.statusCode || 500;
    
    // In production, do not send the stack trace
    const response = {
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };

    res.status(statusCode).json(response);
};

// 404 Not Found Middleware
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `API Route Not Found: ${req.originalUrl}`
    });
};

module.exports = { errorHandler, notFoundHandler };
