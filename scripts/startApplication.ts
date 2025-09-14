import { execSync } from 'child_process';
import { getTokens } from '../server/scripts/generateTokens';
import {loadEnv} from "../server/src/config/env";
import concurrently from 'concurrently';

async function startMonorepo() {
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
        process.env.VITE_API_BASE_URL = 'http://localhost:5000/api';

        // Run migrations
        console.log('Running migrations...');
        execSync('npm run migrate --prefix server', { stdio: 'inherit' });

        // Start server and client concurrently
        console.log('Starting server and client...');
        console.log(process.env.API_BASE_URL);
        await concurrently(
            [
                {
                    command: 'npm run start --prefix server',
                    name: 'server',
                    prefixColor: 'blue',
                },
                {
                    command: 'npm run start --prefix client',
                    name: 'client',
                    prefixColor: 'green',
                },
            ],
            {
                stdio: 'inherit',
                env: { ...process.env },
            }
        ).result;
    } catch (error) {
        console.error('Failed to start monorepo:', error);
        process.exit(1);
    }
}

startMonorepo();