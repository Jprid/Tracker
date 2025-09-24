import {Router, type Request, type Response} from "express";
import {type Knex} from "knex";
import {EntriesController} from "../controllers/entriesController.ts";
import {authenticateToken} from "../middleware/authMiddleware.ts";
import {startOfDay, endOfDay, parseISO} from "date-fns";
import {
    CreateEntrySchema,
    UpdateEntrySchema,
    DeleteEntrySchema,
    GetEntriesParamsSchema,
    GetEntriesByStatusSchema,
    GetEntriesByStatusQuerySchema,
    validateBody,
    validateParams,
    validateQuery
} from "../types/validation.ts";
import logger from '../utils/logger.ts';

export const initializeEntriesRoutes = async (db: Knex): Promise<Router> => {
    const router = Router();

    const entriesController = new EntriesController(db);

    // Get entries for a specific date
    router.get(
        '/entries/:date',
        authenticateToken,
        async (req: Request, res: Response) => {
            logger.info({ date: req.params.date }, 'Getting entries for date');
            try {
                const requestedDate = new Date(req.params.date);
                if (isNaN(requestedDate.getTime())) {
                    return res.status(400).json({ error: 'Invalid date format', success: false });
                }

                const startOfDayUTC = startOfDay(requestedDate);
                const endOfDayUTC = endOfDay(requestedDate);

                const entries = await entriesController.getEntries(
                    startOfDayUTC.toISOString().replace('T', ' '),
                    endOfDayUTC.toISOString().replace('T', ' ')
                );
                res.status(200).json({entries, success: true});
            } catch (error) {
                logger.error({ error, date: req.params.date }, 'Error parsing date or fetching entries');
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        }
    );

    // Get entries by completion status
    router.get(
        '/entries/status/:completed',
        authenticateToken,
        validateParams(GetEntriesByStatusSchema),
        validateQuery(GetEntriesByStatusQuerySchema),
        async (req: Request, res: Response) => {
            logger.info({ completed: req.params.completed, date: req.query.date }, 'Getting entries by status');
            try {
                const completed = req.params.completed === 'true';
                let start: string | undefined;
                let end: string | undefined;

                if (req.query.date) {
                    const requestedDate = parseISO(req.query.date as string);
                    if (isNaN(requestedDate.getTime())) {
                        return res.status(400).json({ error: 'Invalid date format', success: false });
                    }

                    const startOfDayUTC = startOfDay(requestedDate);
                    const endOfDayUTC = endOfDay(requestedDate);

                    start = startOfDayUTC.toISOString().replace('T', ' ');
                    end = endOfDayUTC.toISOString().replace('T', ' ');
                }

                const entries = await entriesController.getEntriesByStatus(completed, start, end);
                res.status(200).json({
                    success: true,
                    entries: entries
                });
            } catch (error) {
                logger.error({ error, completed: req.params.completed }, 'Error fetching entries by status');
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        }
    );

    // Get recent entries (default limit)
    router.get(
        '/entries/recent',
        authenticateToken,
        async (req: Request, res: Response) => {
            try {
                const entries = await entriesController.getRecentEntries(10);
                res.status(200).json({
                    success: true,
                    entries: entries
                });
            } catch (error) {
                logger.error({ error }, 'Error fetching recent entries');
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        }
    );

    // Get recent entries with custom limit
    router.get(
        '/entries/recent/:limit',
        authenticateToken,
        async (req: Request, res: Response) => {
            const limit = parseInt(req.params.limit);
            if (isNaN(limit) || limit < 1 || limit > 100) {
                return res.status(400).json({
                    success: false,
                    error: 'Limit must be a number between 1 and 100'
                });
            }

            try {
                const entries = await entriesController.getRecentEntries(limit);
                res.status(200).json({
                    success: true,
                    entries: entries
                });
            } catch (error) {
                logger.error({ error, limit }, 'Error fetching recent entries');
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        }
    );

    // Create a new entry
    router.post(
        '/entries',
        authenticateToken,
        validateBody(CreateEntrySchema),
        (req: Request, res: Response) => {
            entriesController.createEntry(req, res, null);
        }
    );

    // Update an entry
    router.put(
        '/entries',
        authenticateToken,
        validateBody(UpdateEntrySchema),
        (req: Request, res: Response) => {
            logger.debug({ body: req.body }, 'Update entry request');
            entriesController.updateEntry(req, res, null);
        }
    );

    // Delete an entry
    router.delete(
        '/entries',
        authenticateToken,
        validateBody(DeleteEntrySchema),
        (req: Request, res: Response) => {
            logger.debug({ body: req.body }, 'Delete entry request');
            entriesController.deleteEntry(req, res, null);
        }
    );

    return router;
};
