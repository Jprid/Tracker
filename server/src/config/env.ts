import * as dotenv from 'dotenv';
import {z} from 'zod';

export function loadEnv() {
    const result = dotenv.config();
    if (result.error) {
        throw result.error;
    }

    const envSchema = z.object({
        JWT_SECRET: z.string().min(32),
        PORT: z.string().optional().default('3000'),
        API_BASE_URL: z.string().optional().default('http://localhost:5000/api'),
    });

    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
        throw new Error('Invalid environment variables');
    }
}