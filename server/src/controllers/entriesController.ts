import {type Knex} from "knex";
import {type Request, type Response} from "express";
import logger from '../utils/logger.ts';

export interface Entry {
    id: number;
    completed_at: string | null;
    text: string;
    completed: boolean;
    created_at: string;
}

export class EntriesController {
    private db: Knex;
    private table: string;
    public constructor(db: Knex) {
        this.db = db;
        this.table = 'entries';
    }

    public async getEntries(start: string, end: string) {
        const entries = await this.db<Entry>(this.table)
            .where('created_at', '>=', start)
            .andWhere('created_at', '<', end);
        logger.debug({ start, end, count: entries.length }, 'Entries retrieved');
        return entries;
    }

    public async createEntry(req: Request, res: Response, next: any) {
        logger.debug({ body: req.body }, 'Create entry request');
        const { text, completed = false } = req.body;
        try {
            const [id] = await this.db(this.table)
                .insert({ text, completed })
                .returning('id');
            res.status(201).json({
                success: true,
                message: 'Entry created successfully',
                id: id
            });
        } catch (error) {
            logger.error({ error, body: req.body }, 'Error creating entry');
            res.status(500).json({ success: false, error: 'Failed to create entry' });
        }
    }

    public async updateEntry(req: Request, res: Response, next: any) {
        logger.debug({ body: req.body }, 'Update entry request');
        const { id, text, completed, completed_at } = req.body;
        const exists = await this.db(this.table).where({ id }).first();
        if (!exists) {
            return res.status(404).json({ error: 'Entry not found.', success: false });
        }
        try {
            await this.db(this.table)
                .where({ id })
                .update({
                    text,
                    completed,
                    completed_at: completed_at ? completed_at.replace('T', ' ') : null
                });
            res.status(200).json({
                success: true,
                message: 'Entry updated successfully'
            });
        } catch (error) {
            logger.error({ error, id }, 'Error updating entry');
            res.status(500).json({ success: false, error: 'Failed to update entry' });
        }
    }

    public async deleteEntry(req: Request, res: Response, next: any) {
        const { id } = req.body;
        try {
            const deleted = await this.db(this.table)
                .where({ id })
                .del();
            if (deleted === 0) {
                return res.status(404).json({ error: 'Entry not found.', success: false });
            }
            res.status(200).json({
                success: true,
                message: 'Entry deleted successfully'
            });
        } catch (error) {
            logger.error({ error, id: req.body.id }, 'Error deleting entry');
            res.status(500).json({ success: false, error: 'Failed to delete entry' });
        }
    }

    public async getEntriesByStatus(completed: boolean, start?: string, end?: string): Promise<Entry[]> {
        let query = this.db<Entry>(this.table)
            .where({ completed });

        if (start && end) {
            query = query.where('created_at', '>=', start)
                        .andWhere('created_at', '<', end);
        }

        const entries = await query.orderBy('created_at', 'desc');
        return entries;
    }

    public async getRecentEntries(limit: number = 10): Promise<Entry[]> {
        const entries = await this.db<Entry>(this.table)
            .orderBy('created_at', 'desc')
            .limit(limit);
        return entries;
    }
}
