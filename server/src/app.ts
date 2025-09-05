import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRoutes } from './routes/authRoutes.ts';
import { protectedRoutes } from './routes/protectedRoutes.ts';
import { initializeDatabase } from './config/database.ts';
import { getTokens } from '../scripts/generateTokens.ts';

async function startServer() {
    getTokens(); // Ensure tokens are set in process.env
    await initializeDatabase();

    const app: Express = express();

    // Restrict to localhost
    app.use((req, res, next) => {
        if (req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') {
            return res.status(403).send('Access restricted to localhost');
        }
        next();
    });

    app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
    app.use(express.json());
    app.use(cookieParser());

    app.use('/api/auth', authRoutes);
    app.use('/api', protectedRoutes);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});