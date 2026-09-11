import jwt from 'jsonwebtoken';

const isAuthenticated = async(req, res, next) => {
    try {
        let token = req.cookies?.token;
        if (!token && req.headers?.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated. Please log in.', success: false });
        }
        if (!process.env.JWT_SECRET) {
            console.error('CRITICAL: JWT_SECRET is not configured in environment.');
            return res.status(500).json({ message: 'Authentication service misconfiguration', success: false });
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        if (!decode || !decode.userId) {
            return res.status(401).json({ message: 'Invalid token payload', success: false }); 
        }
        req.id = decode.userId;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired. Please log in again.', success: false });
        }
        return res.status(401).json({ message: 'Invalid or expired token', success: false });
    }
};
export default isAuthenticated;