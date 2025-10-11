import { UserDao } from "#services/dao/user-dao.js";
import { veriffyAccessToken } from "#services/jwt.js";
import { NextFunction, Request, Response } from "express-serve-static-core";

export async function authenticateMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.header("authorization");
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.sendStatus(401);
        return;
    }

    const result = veriffyAccessToken(token);
    if (!result.valid) {
        res.sendStatus(401);
        return;
    }

    req.session = result.payload;

    const user = await UserDao.findById(req.session.userId);

    if (!user) {
        res.sendStatus(401);
        return;
    }

    next();
}
