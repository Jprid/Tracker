import {Router, type Request, type Response} from 'express';
import {generateTokens, refreshAccessToken} from "../services/authService.ts";

const router = Router();

router.post('/login', (_req: Request, res: Response) => {
    // In a real app, validate credentials here
    const tokens = generateTokens();
    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    });
    res.json({ accessToken: tokens.accessToken });
});

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

// Trying out typing with the ends of the keyboard much more splayed out and I think I do like it better

export const authRoutes = router;