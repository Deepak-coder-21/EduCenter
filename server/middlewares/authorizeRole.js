import User from '../models/user.js';

/**
 * Middleware to authorize access based on user role.
 * Must be used AFTER isAuthenticated middleware.
 * @param  {...string} allowedRoles - List of authorized roles (e.g. 'Admin', 'Instructor')
 */
export const authorizeRoles = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User account not found'
                });
            }

            // Attach user to request for downstream handlers
            req.user = user;

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Role '${user.role}' is not authorized to access this resource. Allowed roles: ${allowedRoles.join(', ')}`
                });
            }

            next();
        } catch (error) {
            console.error('Authorization error in authorizeRoles middleware:', error);
            return res.status(500).json({
                success: false,
                message: 'Authorization server error'
            });
        }
    };
};

export default authorizeRoles;
