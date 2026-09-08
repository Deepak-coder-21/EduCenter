import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import userRoutes from './routes/user.Routes.js';
import courseRoutes from './routes/courseRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import connectDB from './database/db.js';
dotenv.config();

const app = express();
app.use(cors(
    {
        origin: 'http://localhost:5173', // Adjust this to your frontend URL
        credentials: true, // Allow cookies to be sent with requests
    }
));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/settings', settingRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));