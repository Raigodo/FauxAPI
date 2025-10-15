import bcrypt from "bcrypt";
import { Router } from "express";
import { Request, Response } from "express-serve-static-core";
import { v4 as uuidv4 } from "uuid";
import { RefreshTokenDao } from "../../services/dao/refresh-token-dao.js";
import { UserDao } from "../../services/dao/user-dao.js";
import {
    generateAccessToken,
    generateRefreshToken,
    veriffyRefreshToken,
} from "../../services/jwt.js";
import { authenticateMiddleware } from "../middleware/authenticate.js";
import { exceptionMiddleware } from "../middleware/exception-middleware.js";
import { multerMiddleware } from "../middleware/multer.js";

const authRouter = Router();

authRouter.post(
    "/register",
    [exceptionMiddleware, multerMiddleware.none()],
    async (
        req: Request<{}, {}, { username?: string; password?: string; nickname?: string }>,
        res: Response
    ) => {
        if (!(req.body.nickname && req.body.username && req.body.password)) {
            res.sendStatus(400);
            return;
        }

        let user = await UserDao.findByUsername(req.body.username);
        if (user) {
            res.sendStatus(400);
            return;
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        await UserDao.create({
            id: uuidv4(),
            nickname: req.body.nickname,
            username: req.body.username,
            password: hashedPassword,
        });

        return res.sendStatus(204);
    }
);

authRouter.post(
    "/login",
    [exceptionMiddleware, multerMiddleware.none()],
    async (req: Request<{}, {}, { username?: string; password?: string }>, res: Response) => {
        if (!req.body.username || !req.body.password) {
            res.sendStatus(400);
            return;
        }

        let user = await UserDao.findByUsername(req.body.username);

        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
            res.sendStatus(400);
            return;
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);

        res.json({
            accessToken,
            refreshToken,
        });
    }
);

authRouter.post(
    "/refresh",
    [exceptionMiddleware, multerMiddleware.none()],
    async (req: Request<{}, {}, { refreshToken?: string }>, res: Response) => {
        if (!req.body.refreshToken) {
            res.sendStatus(400);
            return;
        }

        const refreshToken = req.body.refreshToken;
        if (!refreshToken || !(await RefreshTokenDao.findByValue(refreshToken))) {
            res.sendStatus(401);
            return;
        }

        const veriffyResult = veriffyRefreshToken(refreshToken);

        if (!veriffyResult.valid) {
            res.sendStatus(403);
            return;
        }

        const user = await UserDao.findById(veriffyResult.payload.userId);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = await generateRefreshToken(user);

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    }
);

authRouter.delete(
    "/logout",
    [exceptionMiddleware, authenticateMiddleware, multerMiddleware.none()],
    async (req: Request, res: Response) => {
        const userId = req.session.userId;
        await RefreshTokenDao.delete(userId);
        res.sendStatus(204);
    }
);

export default authRouter;
