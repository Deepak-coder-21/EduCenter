import jwt from 'jsonwebtoken';

export const generateToken = (res, user, message) => {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const isProd = process.env.NODE_ENV === 'production';
    
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;

    return res.status(200)
    .cookie('token', token, {
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    })
    .json({ success: true, message, user: userObj, token });
};