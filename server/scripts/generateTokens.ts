import { generateTokens } from '../src/services/authService.ts';

function generateTokensScript() {
    try {
        const tokens = generateTokens();
        // Set tokens as environment variables
        process.env.ACCESS_TOKEN = tokens.accessToken;
        process.env.REFRESH_TOKEN = tokens.refreshToken;
        console.debug('Tokens generated and set as environment variables');
        return tokens;
    } catch (error) {
        console.error('Failed to generate tokens:', error);
        process.exit(1);
    }
}


export function getTokens() {
    if (!process.env.ACCESS_TOKEN || !process.env.REFRESH_TOKEN) {
        generateTokensScript();
    }
    return {
        accessToken: process.env.ACCESS_TOKEN!,
        refreshToken: process.env.REFRESH_TOKEN!,
    };
}