import mongoose from 'mongoose';

/**
 * Middleware to validate MongoDB ObjectId route parameters.
 * Prevents CastError crashes and parameter injection attacks.
 *
 * @param  {...string} paramNames - Names of the route parameters to validate (e.g. 'id', 'courseId')
 */
export const validateObjectId = (...paramNames) => {
    return (req, res, next) => {
        for (const name of paramNames) {
            const val = req.params[name];
            if (val && !mongoose.Types.ObjectId.isValid(val)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid ID format for parameter: ${name}`
                });
            }
        }
        next();
    };
};

export default validateObjectId;
