import type {SubstanceEntry} from '../interfaces';

export async function getEntries(date: string, accessToken: string): Promise<SubstanceEntry[]> {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/habits/${date}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        },
    });
    if (!response.ok) {
        if (response.status === 403) {
            // Try to refresh token
            const tokenResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + accessToken
                },
            });
            if (!tokenResponse.ok) {
                throw new Error('Failed to refresh access token');
            }
            // You may want to update your app's token here
            // e.g. localStorage.setItem('accessToken', newToken)
            throw new Error('Access token expired');
        }
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    const json = await response.json();
    return mapEntries(json.entries);
}

export async function addEntry(entry: Omit<SubstanceEntry, 'id'>, accessToken: string): Promise<Response> {
    const date = new Date().toISOString().split('T')[0];
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/habits/${date}/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        },
        body: JSON.stringify({
            habit_name: entry.entry_type,
            dose: entry.dose,
            notes: entry.notes,
            completed: true
        })
    });
}

function mapEntries(entries: any[]): SubstanceEntry[] {
    return entries.map((entry: any) => ({
        id: entry.id,
        time: new Date(entry.created_at + 'Z').toLocaleString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }),
        entry_type: entry.habit_name,
        dose: entry.dose,
        notes: entry.notes,
        completed: entry.completed,
    }));
}

export async function getDayTotals() {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/habits/nicotine/pivot`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + import.meta.env.VITE_ACCESS_TOKEN
        },
    })
    if (!response.ok) {
        console.error('Failed to fetch day totals');
    }
    const json = await response.json();
    // console.debug(json);
    return json.entries.map(x =>{ return {day: parseInt(x.created_at.replace('2025-', '').split('-')[1]), total: x.total}});
}