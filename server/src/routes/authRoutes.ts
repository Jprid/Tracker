import {Router, type Request, type Response} from 'express';
import {refreshAccessToken} from "../services/authService.ts";

const router = Router();

router.post('/refresh', (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401).send('No refresh token provided');
        return;
    }
    const tokens = refreshAccessToken(refreshToken);
    if (!tokens) {
        res.status(403).send('Invalid refresh token');
        return;
    }
    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    });
    res.json({ accessToken: tokens.accessToken });
});

export const authRoutes = router;