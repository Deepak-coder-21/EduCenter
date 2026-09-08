
import mongoose from 'mongoose';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI); 

        console.log('MongoDB connected');

        // Ensure SMTP_USER email is always an Admin in the database
        const smtpAdminEmail = process.env.SMTP_USER?.toLowerCase().trim();
        if (smtpAdminEmail) {
            const User = mongoose.model('User');
            const adminUser = await User.findOne({
                email: { $regex: new RegExp(`^${smtpAdminEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
            });
            if (!adminUser) {
                const defaultPasswordHash = await bcrypt.hash('Admin@12345', 10);
                await User.create({
                    name: 'Admin',
                    email: smtpAdminEmail,
                    password: defaultPasswordHash,
                    role: 'Admin'
                });
                console.log(`Initialized Admin account for SMTP_USER (${smtpAdminEmail})`);
            }
        }
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
    }

export default connectDB;