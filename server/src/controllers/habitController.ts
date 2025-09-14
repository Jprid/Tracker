import {getDatabase} from "../config/database.ts";
import {type Knex} from "knex";
import {type Request, type Response} from "express";

export interface Entry {
    id: number;
    day_id: number;
    habit_name: string;
    dose: number;
    completed: boolean;
}

export class HabitController {
    private db: Knex;
    public constructor(db: Knex) {
        this.db = db;
    }

    private async getDayId(day: Date) {
        const dayString = day.toISOString().split('T')[0];
        const dayExists = await this.db.select('id').from('days')
            .where('date', dayString).first();
        console.log("IS the day in the days table " + dayExists);
        if (dayExists === undefined) {
            await this.db.insert({ date: dayString }).into('days');
        }
        return this.db.select('id')
            .from('days')
            .where('date', dayString)
            .first();
    }

    public async getHabitEntries(start: string, end: string) {
        // Get all day_ids in the range
        // Query habit_entries for those day_ids
        console.log(start);
        console.log(end);
        const entries = await this.db<Entry>('habit_entries')
            .where('created_at', '>=', start)
            .andWhere('created_at', '<', end);
        console.log(`Entries from ${start} to ${end}:`, JSON.stringify(entries));
        return entries;
    }


    public async createHabitEntry(req: Request, res: Response, next: any) {
        console.log(req.body);
        const { date, habit_name, dose, completed } = req.body ;
        try {
            const day_id = (await this.getDayId(new Date(date))).id;
            return this.db.insert({ day_id, habit_name, dose, completed }).into('habit_entries');
        } catch (error) {
            next(error);
        }
    }

    public async updateHabitEntry(req: Request, res: Response, next: any) {
        const { id, name, dose, completed } = req.body;
        try {
            await this.db('habits')
                .where({ id })
                .update({ name, dose, completed });
            res.status(200).json({ message: 'Habit entry updated.' });
        } catch (error) {
            next(error);
        }
    }

    public async deleteHabitEntry(req: Request, res: Response, next: any) {
        const { id } = req.body;
        try {
            await this.db('habits')
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
            LEFT JOIN habit_entries he ON date(he.created_at) = dr.date AND he.habit_name = ?
            GROUP BY dr.date
            ORDER BY dr.date ASC
            `,
            [`-${daysBeforeToday} days`, `${habit_name}`]);
    }
}
