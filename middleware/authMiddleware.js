const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    // Check Authorization header first
    let rawToken = null;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        rawToken = authHeader.split(' ')[1];
    } else {
        // Fallback to cookies (token set by our auth controller or Better Auth)
        rawToken = req.cookies['better-auth.session_token'] || req.cookies.token;
    }
    if (!rawToken) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (error) {
        // Better Auth session tokens are not JWTs, so look up the session in MongoDB.
        try {
            const dbToken = rawToken.split('.')[0];
            const mongoose = require('mongoose');
            const session = await mongoose.connection.db.collection('session').findOne({ token: dbToken });
            if (session) {
                const user = await mongoose.connection.db.collection('user').findOne({ _id: session.userId || session.user_id });
                if (user) {
                    req.user = { email: user.email, role: user.role || 'user', id: user._id };
                    return next();
                }
            }
        } catch (dbError) {
            console.error('Session DB Error:', dbError);
        }
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

const verifyOwner = (req, res, next) => {
    if (req.user && (req.user.role === 'owner' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Owner permissions required.' });
    }
};

module.exports = { verifyToken, verifyOwner };
