import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';

import userRoutes from './routes/user.Routes.js';
import courseRoutes from './routes/courseRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import connectDB from './database/db.js';
dotenv.config();

const app = express();

// Trust reverse proxies (Render, Railway, Heroku, AWS, Vercel) for secure cookies & HTTPS detection
app.set('trust proxy', 1);

// Allowed origins configuration
const rawClientUrl = process.env.CLIENT_URL || '';
const configuredOrigins = rawClientUrl
    .split(',')
    .map(url => url.trim().replace(/\/+$/, ''))
    .filter(Boolean);

const defaultOrigins = [
    'https://edu-center-three.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://localhost:4173'
];

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman, health checkers)
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/+$/, '');

        const isAllowedOrigin = allowedOrigins.includes(cleanOrigin);
        const isLocalDevOrigin = process.env.NODE_ENV !== 'production' &&
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin);
        const isVercelOrigin = /^https:\/\/[a-zA-Z0-9_.-]+\.vercel\.app$/.test(cleanOrigin);

        if (isAllowedOrigin || isLocalDevOrigin || isVercelOrigin) {
            return callback(null, true);
        }

        console.warn(`[CORS WARN] Origin ${origin} not explicitly whitelisted. Allowed: ${allowedOrigins.join(', ')}`);
        return callback(null, false);
    },
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`[SECURITY] Sanitized forbidden NoSQL key: ${key} in ${req.originalUrl}`);
    }
}));

// Connect to MongoDB
connectDB();

// Health check & root routes for hosting providers (Render, Railway, AWS, etc.)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.status(200).send('EduCenter Backend API is running successfully.');
});

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/settings', settingRoutes);

// Catch-all 404 for unhandled API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: `Endpoint ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));