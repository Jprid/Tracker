import type { Knex } from 'knex';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine database path relative to server directory
const dbDir = path.join(__dirname, './data');
const dbPath = path.join(dbDir, 'database.sqlite');

// Ensure data directory exists synchronously (needed for CLI)
try {
    fsSync.mkdirSync(dbDir, { recursive: true });
} catch (error) {
    // Directory might already exist, which is fine
    if ((error as any).code !== 'EEXIST') {
        console.warn('Could not create database directory:', error);
    }
}

// Ensure data directory exists asynchronously (for app usage)
async function ensureDbDirectory() {
    try {
        await fs.mkdir(dbDir, { recursive: true });
    } catch (error) {
        console.error('Failed to create database directory:', error);
        throw new Error('Cannot create database directory');
    }
}

// Base configuration
const baseConfig: Knex.Config = {
    client: 'sqlite3',
    connection: {
        filename: dbPath,
    },
    useNullAsDefault: true,
    migrations: {
        directory: path.join(__dirname, './src/migrations'),
    },
};

// Export function that ensures directory exists and returns config
export const getConfig = async (): Promise<Knex.Config> => {
    await ensureDbDirectory();
    return baseConfig;
};

// Export default config for CLI usage
export default baseConfig;