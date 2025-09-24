import { API_CONSTANTS } from "../utils/constants.ts";

export async function refreshToken(): Promise<string> {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    return data.accessToken;
}

export async function getUniqueSubstances(accessToken?: string, setAccessToken?: (token: string | undefined) => void): Promise<string[]> {
    const response = await request(`${import.meta.env.VITE_API_BASE_URL}/medicine/substances`, {
        method: 'GET',
    }, accessToken, setAccessToken);

    if (!response.ok) {
        throw new Error('Failed to fetch unique substances');
    }

    const data = await response.json();
    return data.substances || [];
}

export async function request(url: string, options: RequestInit = {}, accessToken?: string, setAccessToken?: (token: string | undefined) => void): Promise<Response> {
    const hasRefereshTokenCookie = document.cookie.includes(API_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME);
    if (!hasRefereshTokenCookie) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/init`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken || import.meta.env.VITE_ACCESS_TOKEN}`
            },
        });
    }
    const config: RequestInit = {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken || import.meta.env.VITE_ACCESS_TOKEN}`
        },
    };
    let response = await fetch(`${url}`, config);
    if (response.status === 401 || response.status == 403) {
        try {
            const token = await refreshToken();
            if (setAccessToken) {
                setAccessToken(token);
            }
            // Use the new token for the retry request
            config.headers = {
                ...config.headers,
                'Authorization': `Bearer ${token}`
            }
            response = await fetch(`${url}`, config);
        } catch (error) {
            console.error('Token refresh failed:', error);
            throw error;
        }
    }

    return response;
}