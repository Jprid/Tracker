import { Router, type Request, type Response } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.ts';

const router = Router();

router.get('/protected',
    authenticateToken,
    (req: Request, res: Response) => {
        res.json({ message: 'Protected data', user: req.user });
    }
);

export const protectedRoutes = router;
