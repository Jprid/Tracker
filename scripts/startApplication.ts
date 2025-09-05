import { execSync } from 'child_process';
import { getTokens } from '../server/scripts/generateTokens';
import {loadEnv} from "../server/src/config/env";

function startMonorepo() {
    try {
        // Generate tokens
        loadEnv();
        const tokens = getTokens();
        console.log("CREATED TOKENS");
        // Set environment variables for server and client
        process.env.ACCESS_TOKEN = tokens.accessToken;
        process.env.REFRESH_TOKEN = tokens.refreshToken;
        process.env.VITE_ACCESS_TOKEN = tokens.accessToken;
        process.env.VITE_REFRESH_TOKEN = tokens.refreshToken;

        // Run migrations
        console.log('Running migrations...');
        execSync('npm run migrate --prefix server', { stdio: 'inherit' });

        // Start server and client concurrently
        console.log('Starting server and client...');
        execSync('npm run start --prefix server & npm run dev --prefix client', {
            stdio: 'inherit',
            env: { ...process.env },
        });
    } catch (error) {
        console.error('Failed to start monorepo:', error);
        process.exit(1);
    }
}

startMonorepo();