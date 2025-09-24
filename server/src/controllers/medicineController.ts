import {type Knex} from "knex";
import {type Request, type Response} from "express";
import logger from '../utils/logger.ts';

export interface Entry {
    id: number;
    day_id: number;
    habit_name: string;
    dose: number;
    completed: boolean;
}

export class MedicineController {
    private db: Knex;
    private table: string;
    public constructor(db: Knex) {
        this.db = db;
        this.table = 'medicine';
    }

    public async getHabitEntries(start: string, end: string) {
        // Get all day_ids in the range
        // Query habit_entries for those day_ids
        const entries = await this.db<Entry>(this.table)
            .where('created_at', '>=', start)
            .andWhere('created_at', '<', end)
            .orderBy('created_at', 'asc');
        logger.debug({ start, end, count: entries.length }, 'Habit entries retrieved');
        return entries;
    }

    public async createHabitEntry(req: Request, res: Response, next: any) {
        logger.debug({ body: req.body }, 'Create habit entry request');
        const { habit_name, dose } = req.body ;
        try {
            return this.db.insert({ name: habit_name.toLowerCase(), dose })
                .into(this.table);
        } catch (error) {
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: any) {
        logger.debug({ body: req.body }, 'Update habit entry request');
        const { id, name, dose, created_at } = req.body;
        const exists = await this.db(this.table).where({ id }).first();
        if (!exists) {
            return res.status(404).json({ error: 'Habit entry not found.' });
        }
        try {
            await this.db(this.table)
                .where({ id })
                .update({ name, dose, created_at: created_at.replace('T', ' ') });
            res.status(200).json({ message: 'Habit entry updated.' });
        } catch (error) {
            next(error);
        }
    }

    public async deleteHabitEntry(req: Request, res: Response, next: any) {
        const { id } = req.body;
        try {
            await this.db(this.table)
                .where({ id })
                .del();
            res.status(200).json({ message: 'Habit entry deleted.' });
        } catch (error) {
            next(error);
        }
    }

    async getHabitTotals(habit_name: string, daysBeforeToday: number = 10): Promise<{}[]> {
        return this.db.raw(`
            WITH RECURSIVE date_range AS (
                SELECT date('now', ?, 'localtime') AS date
                UNION ALL
                SELECT date(date, '+1 day')
                FROM date_range
                WHERE date < date('now', 'localtime')
            )
            SELECT
                dr.date AS created_at,
                COALESCE(SUM(he.dose), 0) AS total
            FROM date_range dr
            LEFT JOIN ${this.table} he ON date(he.created_at, 'localtime') = dr.date AND he.name = ?
            GROUP BY dr.date
            ORDER BY dr.date ASC
            `,
            [`-${daysBeforeToday} days`, habit_name]);
    }

    async getHourHistogram(name: string, hoursBefore: number = 10): Promise<{}[]> {
        return this.db.raw( `
            WITH RECURSIVE date_range AS (
                SELECT datetime('now', ?, 'localtime') AS date
                UNION ALL
                SELECT datetime(date, '+1 hour')
                FROM date_range
                WHERE date < datetime('now', 'localtime')
            )
            SELECT
            dr.date as created_at,
                COALESCE(COUNT(he.id), 0) AS total
            FROM date_range dr
            LEFT JOIN ${this.table} he
            ON strftime('%Y-%m-%d %H', he.created_at, 'localtime') = strftime('%Y-%m-%d %H', dr.date)
            AND he.name = ?
                GROUP BY dr.date
            ORDER BY dr.date ASC
        `, [`-${hoursBefore} hours`, name]);
    }

    public async getUniqueSubstances(): Promise<string[]> {
        const substances = await this.db(this.table)
            .distinct('name')
            .pluck('name');
        return substances;
    }
}
