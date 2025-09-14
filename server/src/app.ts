import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRoutes } from './routes/authRoutes.ts';
import { initializeDatabase } from './config/database.ts';
import { getTokens } from '../scripts/generateTokens.ts';
import {initializeRoutes} from "./routes/habitRoutes.ts";

async function startServer() {
    getTokens(); // Ensure tokens are set in process.env

    const db = await initializeDatabase();
    const app: Express = express();

    // Restrict to localhost
    app.use((req, res, next) => {
        if (req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') {
            return res.status(403).send('Access restricted to localhost');
        }
        next();
    });

    app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
    app.use(express.json());
    app.use(cookieParser());

    const medicineRoutes = await initializeRoutes(db);
    app.use('/api/auth', authRoutes);
    app.use('/api', medicineRoutes);

    const PORT = process.env.SERVER_PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});