import { generateTokens } from '../src/services/authService.ts';

function generateTokensScript() {
    try {
        const tokens = generateTokens();
        console.debug('Tokens generated successfully');
        return tokens;
    } catch (error) {
        console.error('Failed to generate tokens:', error);
        process.exit(1);
    }
}

export function getTokens() {
    // Generate tokens on demand instead of storing in environment
    const tokens = generateTokensScript();
    return tokens;
}