import jwt from 'jsonwebtoken';

const isAuthenticated = async(req, res, next) => {
    try {
        const token  = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated', success: false });
        }
        const decode = await jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return res.status(401).json({ message: 'Invalid token', success: false }); 
        }
        req.id = decode.userId;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ message: 'Invalid or expired token', success: false });
    }
};
export default isAuthenticated;