import User from '../models/user.js';
import Otp from '../models/otp.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken.js';
import { uploadMedia, deleteMediaFromCloudinary } from '../utils/cloudinary.js';
import { sendEmail } from '../utils/sendEmail.js';


export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email,
            password: hashedPassword
        });
        return res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        const cleanEmail = email.toLowerCase().trim();
        const smtpAdminEmail = (process.env.SMTP_USER || '').toLowerCase().trim();

        const user = await User.findOne({
            email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        generateToken(res, user, `Welcome back ${user.name}`);
        // return res.status(200).json({ message: 'Login successful', userId: user._id });
    }
    catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const logout = async (req, res) => {
    try {
        const isProd = process.env.NODE_ENV === 'production';
        return res.status(200).cookie("token", "", {
            maxAge: 0,
            httpOnly: true,
            sameSite: isProd ? 'none' : 'lax',
            secure: isProd
        }).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user?._id || req.id; // prefer req.user._id set by auth middleware
        const { name } = req.body;
        const profilePhoto = req.file;

        // build update object safely
        const updatedData = {};
        if (name) updatedData.name = name;

        // only handle photo when a file was uploaded
        if (profilePhoto) {
            // ensure user exists before deleting old image
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found', success: false });
            }

            if (user.photoUrl) {
                await deleteMediaFromCloudinary(user.photoUrl);
            }

            // upload new image (use profilePhoto.path only if multer stores file on disk)
            if (!profilePhoto.path && !profilePhoto.buffer) {
                return res.status(400).json({ message: 'Uploaded file missing data', success: false });
            }
            const cloudResponse = await uploadMedia(profilePhoto.path || profilePhoto.buffer);
            if (cloudResponse?.secure_url) {
                updatedData.photoUrl = cloudResponse.secure_url;
            }
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        return res.status(200).json({ user: updatedUser, message: 'Profile updated successfully', success: true });
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
};

// Admin: Get all registered users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.error('Error fetching all users:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
};

// Admin: Update user role
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['Student', 'Instructor', 'Admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role specified. Must be Student, Instructor, or Admin.' });
        }

        if (req.id === id && role !== 'Admin') {
            return res.status(400).json({ success: false, message: 'You cannot demote your own admin account.' });
        }

        const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({ success: true, message: `User role updated to ${role}`, user });
    } catch (error) {
        console.error('Error updating user role:', error);
        return res.status(500).json({ success: false, message: 'Failed to update user role' });
    }
};

// Admin: Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.id === id) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.photoUrl && user.photoUrl.includes('cloudinary')) {
            try {
                const publicId = user.photoUrl.split('/').pop().split('.')[0];
                await deleteMediaFromCloudinary(publicId);
            } catch (err) {
                console.warn('Failed to delete user photo:', err);
            }
        }

        await User.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
};

// ================= OTP AUTH CONTROLLERS =================

/**
 * 1. Send OTP for Signup Verification
 */
export const sendSignupOtp = async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email address is required' });
        }

        const cleanEmail = email.toLowerCase().trim();

        // Ensure user doesn't already exist
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists. Please log in.' });
        }

        // Rate limiting check (60 seconds cooldown)
        const recentOtp = await Otp.findOne({
            email: cleanEmail,
            purpose: 'signup',
            createdAt: { $gte: new Date(Date.now() - 60 * 1000) }
        });
        if (recentOtp) {
            return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting a new OTP.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Clear previous signup OTPs for this email
        await Otp.deleteMany({ email: cleanEmail, purpose: 'signup' });

        // Save new OTP record
        await Otp.create({
            email: cleanEmail,
            otp,
            purpose: 'signup',
        });

        // Send email with OTP
        await sendEmail({
            to: cleanEmail,
            name: name || '',
            otp,
            purpose: 'signup',
        });

        return res.status(200).json({
            success: true,
            message: `Verification code sent to ${cleanEmail}`,
        });
    } catch (error) {
        console.error('Error in sendSignupOtp:', error);
        return res.status(500).json({ success: false, message: 'Failed to send verification code. Please try again.' });
    }
};

/**
 * 2. Verify Signup OTP and Register User
 */
export const verifySignupOtp = async (req, res) => {
    try {
        const { name, email, password, otp } = req.body;
        if (!name || !email || !password || !otp) {
            return res.status(400).json({ success: false, message: 'All fields including the verification code are required' });
        }

        const cleanEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists' });
        }

        // Verify OTP
        const otpRecord = await Otp.findOne({
            email: cleanEmail,
            otp: String(otp).trim(),
            purpose: 'signup',
        });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification code. Please request a new one.' });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const smtpAdminEmail = process.env.SMTP_USER?.toLowerCase().trim();
        const userRole = (smtpAdminEmail && cleanEmail === smtpAdminEmail) ? 'Admin' : 'Student';

        const newUser = await User.create({
            name,
            email: cleanEmail,
            password: hashedPassword,
            role: userRole,
        });

        // Purge used OTP
        await Otp.deleteMany({ email: cleanEmail, purpose: 'signup' });

        return res.status(201).json({
            success: true,
            message: 'Account verified and created successfully! You can now log in.',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error('Error in verifySignupOtp:', error);
        return res.status(500).json({ success: false, message: 'Failed to complete registration' });
    }
};

/**
 * 3. Send OTP for Forgot Password
 */
export const sendResetPasswordOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email address is required' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const smtpAdminEmail = (process.env.SMTP_USER || '').toLowerCase().trim();

        // Check if user exists (case-insensitive)
        let user = await User.findOne({
            email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        // SMTP_USER is always an Admin. If it doesn't exist yet, auto-create it in the database.
        if (!user && smtpAdminEmail && cleanEmail === smtpAdminEmail) {
            const defaultPasswordHash = await bcrypt.hash('Admin@12345', 10);
            user = await User.create({
                name: 'Admin',
                email: smtpAdminEmail,
                password: defaultPasswordHash,
                role: 'Admin',
            });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with this email address' });
        }

        // Determine whether user is currently an Admin based on database role
        const isAdmin = user.role === 'Admin';

        // When any user with Admin role requests password reset, send OTP to SMTP_USER.
        // When any user with Student role (including those converted from Admin to Student) requests reset,
        // ALWAYS send OTP directly to the student's email address!
        const recipientEmail = (isAdmin && smtpAdminEmail) ? smtpAdminEmail : cleanEmail;

        // Rate limiting check (60 seconds cooldown)
        const recentOtp = await Otp.findOne({
            email: { $in: [cleanEmail, recipientEmail] },
            purpose: 'reset_password',
            createdAt: { $gte: new Date(Date.now() - 60 * 1000) }
        });
        if (recentOtp) {
            return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting another code.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Clear previous reset OTPs
        await Otp.deleteMany({
            email: { $in: [cleanEmail, recipientEmail] },
            purpose: 'reset_password'
        });

        // Save OTP records for both emails so verification succeeds with either
        await Otp.create({
            email: cleanEmail,
            otp,
            purpose: 'reset_password',
        });

        if (recipientEmail !== cleanEmail) {
            await Otp.create({
                email: recipientEmail,
                otp,
                purpose: 'reset_password',
            });
        }

        // Send email with OTP to recipientEmail (which is SMTP_USER for admin accounts)
        await sendEmail({
            to: recipientEmail,
            name: (user.name || 'Admin').trim(),
            otp,
            purpose: 'reset_password',
        });

        const successMessage = (isAdmin && smtpAdminEmail && cleanEmail !== smtpAdminEmail)
            ? `Admin verification code sent to ${smtpAdminEmail}`
            : `Password reset code sent to ${cleanEmail}`;

        return res.status(200).json({
            success: true,
            message: successMessage,
            sentTo: recipientEmail,
            isAdmin,
        });
    } catch (error) {
        console.error('Error in sendResetPasswordOtp:', error);
        return res.status(500).json({ success: false, message: 'Failed to send password reset code' });
    }
};

/**
 * 4. Verify Reset OTP and Update Password
 */
export const resetPasswordWithOtp = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email, verification code, and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const smtpAdminEmail = (process.env.SMTP_USER || '').toLowerCase().trim();

        let user = await User.findOne({
            email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        // If user was not yet created for SMTP_USER, create it as Admin
        if (!user && smtpAdminEmail && cleanEmail === smtpAdminEmail) {
            user = await User.create({
                name: 'Admin',
                email: smtpAdminEmail,
                password: await bcrypt.hash(newPassword, 10),
                role: 'Admin',
            });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify OTP - matches either the entered email or the SMTP_USER admin email
        const allowedEmails = [cleanEmail];
        if (smtpAdminEmail) allowedEmails.push(smtpAdminEmail);

        const otpRecord = await Otp.findOne({
            email: { $in: allowedEmails },
            otp: String(otp).trim(),
            purpose: 'reset_password',
        });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification code. Please request a new one.' });
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        // Purge used OTP
        await Otp.deleteMany({
            email: { $in: allowedEmails },
            purpose: 'reset_password'
        });

        return res.status(200).json({
            success: true,
            message: 'Password reset successful! You can now log in with your new password.',
        });
    } catch (error) {
        console.error('Error in resetPasswordWithOtp:', error);
        return res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
};



