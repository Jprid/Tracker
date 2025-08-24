import type { Knex } from 'knex';
import path from 'path';
import fs from 'fs/promises';

// Determine database path relative to server directory
const dbDir = path.join(__dirname, './data');
const dbPath = path.join(dbDir, 'database.sqlite');

// Ensure data directory exists
async function ensureDbDirectory() {
    try {
        await fs.mkdir(dbDir, { recursive: true });
    } catch (error) {
        console.error('Failed to create database directory:', error);
        throw new Error('Cannot create database directory');
    }
}

await ensureDbDirectory();

const config: Knex.Config = {
    client: 'sqlite3',
    connection: {
        filename: dbPath,
    },
    useNullAsDefault: true,
    migrations: {
        directory: path.join(__dirname, './src/migrations'),
    },
};

export default config;