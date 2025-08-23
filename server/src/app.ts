import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {loadEnv} from "./config/env.ts";
import {authRoutes} from "./routes/authRoutes.ts";
import {protectedRoutes} from "./routes/protectedRoutes.ts";

loadEnv();

const app = express();
app.use(cors({origin: 'http://localhost:3000', credentials: true}));
app.use(express.json());
app.use(cookieParser())

app.use("/api/auth.ts", authRoutes);
app.use("/api", protectedRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));