import {Router, type Request, type Response} from "express";
import {type Knex} from "knex";
import {HabitController} from "../controllers/habitController.ts";
import {authenticateToken} from "../middleware/authMiddleware.ts";
import {addDays, format, setHours} from "date-fns";
import {authRoutes} from "./authRoutes.ts";

export const initializeRoutes = async (db: Knex): Promise<Router> => {
    const router = Router();

    // Initialize Knex with SQLite
    // Instantiate controller with Knex instance
    const habitController = new HabitController(db);

    // Route for getting today's habits
    router.get(
        '/habits/today',
        authenticateToken,
        async (req: Request, res: Response) => {
            console.debug('Getting entries for today');
            res.status(200).json({ success: true, entries: [] });
        }
    );

    router.get(
        '/habits/:habit_name/pivot',
        authenticateToken,
        async (req: Request, res: Response) => {
            console.debug('Getting entries for the last ten days');
            try {
                const values = await habitController.getHabitTotals(req.params.habit_name, 9);
                res.status(200).json(
                    {
                        success: true,
                        entries: values,
                    }
                )
            } catch (error) {
                console.error('Error fetching entries:', error);
                res.status(500).json({ success: false, error: 'Internal server error' });
            }

        }
    );

    router.get(
        '/habits/:date',
        authenticateToken,
        async (req: Request, res: Response) => {
            console.log('Getting entries for ' + req.params.date);
            const requestedDate = new Date(req.params.date);
            if (isNaN(requestedDate.getTime())) {
                return res.status(400).json({ error: 'Invalid date format', success: false });
            }

            requestedDate.setHours(0, 0, 0, 0);
            const startOfDayLocal = new Date(requestedDate);

            const startOfDayUTC = new Date(startOfDayLocal.toISOString());

            const nextDayLocal = new Date(startOfDayLocal);
            nextDayLocal.setDate(startOfDayLocal.getDate() + 1);

            const endOfDayUTC = new Date(nextDayLocal.toISOString());

            // console.log('Start of day (UTC):', startOfDayUTC.toISOString()); // e.g., 2025-09-11T05:00:00.000Z (for CDT)
            // console.log('End of day (UTC):', endOfDayUTC.toISOString());   // e.g., 2025-09-12T05:00:00.000Z (for CDT)
            const entries = await habitController.getHabitEntries(startOfDayUTC.toISOString().replace('T', ' '), endOfDayUTC.toISOString().replace('T', ' '));
            res.status(200).json({entries, success: true});
        }
    );

    // Route for creating a habit entry
    router.post(
        '/habits/:date/create',
        authenticateToken,
        (req: Request, res: Response) => {
            req.body.date = req.params.date;
            habitController.createHabitEntry(req, res, null);
        }
    );

    // Route for updating a habit entry
    router.put(
        '/habits/update',
        authenticateToken,
        (req: Request, res: Response) => {
            habitController.updateHabitEntry(req, res, null);
        }
    );

    return router;
};