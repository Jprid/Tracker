import knex, { type Knex } from 'knex';
import config from '../../knexfile.ts';

export let db: Knex | null = null;

export async function initializeDatabase(): Promise<Knex> {
    if (db) return db;

    try {
        db = knex(config);
        await db.raw('SELECT 1'); // Test connection
        console.log('Database connected successfully');

        // Apply migrations
        await db.migrate.latest();
        console.log('Migrations applied successfully');

        return db;
    } catch (error) {
        console.error('Database connection or migration failed:', error);
        throw new Error('Failed to initialize database');
    }
}

export function getDatabase(): Knex {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
}