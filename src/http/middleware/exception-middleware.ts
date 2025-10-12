import { NextFunction, Request, Response } from "express-serve-static-core";

export async function exceptionMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        next();
    } catch (error) {
        res.status(500).json(error);
    }
}
