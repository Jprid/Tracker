import {Router, type Request, type Response} from "express";
import {type Knex} from "knex";
import {MedicineController} from "../controllers/medicineController.ts";
import {authenticateToken} from "../middleware/authMiddleware.ts";
import {startOfDay, endOfDay, parseISO} from "date-fns";
import {
    CreateHabitEntrySchema,
    CreateHabitEntryParamsSchema,
    UpdateHabitEntrySchema,
    DeleteHabitEntrySchema,
    GetHabitTotalsParamsSchema,
    validateBody,
    validateParams
} from "../types/validation.ts";
import logger from '../utils/logger.ts';

export const initializeRoutes = async (db: Knex): Promise<Router> => {
    const router = Router();

    const medicineController = new MedicineController(db);

    router.get(
        '/medicine/substances',
        authenticateToken,
        async (req: Request, res: Response) => {
            logger.debug('Getting unique substances');
            try {
                const substances = await medicineController.getUniqueSubstances();
                res.status(200).json(
                    {
                        success: true,
                        substances: substances,
                    }
                )
            } catch (error) {
                logger.error({ error }, 'Error fetching unique substances');
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        }
    );

    router.get(
        '/medicine/:name/pivot',
        authenticateToken,
        validateParams(GetHabitTotalsParamsSchema),
        async (req: Request, res: Response) => {
            logger.debug({ name: req.params.name }, 'Getting entries for the last ten days');
            try {
                const values = await medicineController.getHabitTotals(req.params.name, 9);
                res.status(200).json(
                    {
                        success: true,
                        entries: values,
                    }
                )
            } catch (error) {
                logger.error({ error, name: req.params.name }, 'Error fetching entries');
                res.status(500).json({ success: false, error: 'Internal server error' });
            }

        }
    );

    router.get(
        '/medicine/:date',
        authenticateToken,
        async (req: Request, res: Response) => {
            logger.info({ date: req.params.date }, 'Getting medicine entries for date');
            try {
                const requestedDate = new Date(req.params.date);
                if (isNaN(requestedDate.getTime())) {
                    return res.status(400).json({ error: 'Invalid date format', success: false });
                }

                const startOfDayUTC = startOfDay(requestedDate);
                const endOfDayUTC = endOfDay(requestedDate);

                const entries = await medicineController.getHabitEntries(startOfDayUTC.toISOString().replace('T', ' '), endOfDayUTC.toISOString().replace('T', ' '));
                res.status(200).json({entries, success: true});
            } catch (error) {
                logger.error({ error, date: req.params.date }, 'Error parsing date or fetching medicine entries');
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        }
    );

    // Route for creating a habit entry
    router.post(
        '/medicine/:date/create',
        authenticateToken,
        validateParams(CreateHabitEntryParamsSchema),
        validateBody(CreateHabitEntrySchema),
        (req: Request, res: Response) => {
            req.body.date = req.params.date;
            medicineController.createHabitEntry(req, res, null);
        }
    );

    // Route for updating a habit entry
    router.put(
        '/medicine/update',
        authenticateToken,
        validateBody(UpdateHabitEntrySchema),
        (req: Request, res: Response) => {
            logger.debug({ body: req.body }, 'Update medicine entry request');
            medicineController.update(req, res, null);
        }
    );

    // Route for deleting a habit entry
    router.delete(
        '/medicine/delete',
        authenticateToken,
        validateBody(DeleteHabitEntrySchema),
        (req: Request, res: Response) => {
            logger.debug({ body: req.body }, 'Delete medicine entry request');
            medicineController.deleteHabitEntry(req, res, null);
        }
    );

    return router;
};