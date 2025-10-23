import { Request, Response, Router } from "express";
import { UserDao } from "../../services/dao/user-dao.js";
import { authenticateMiddleware } from "../middleware/authenticate.js";
import { exceptionMiddleware } from "../middleware/exception-middleware.js";
import { multerMiddleware } from "../middleware/multer.js";

const usersRouter = Router();

usersRouter.get(
    "/",
    [exceptionMiddleware, authenticateMiddleware],
    async (req: Request, res: Response) => {
        const users = await UserDao.all();
        return res.json(users);
    }
);

usersRouter.get(
    "/:id",
    [exceptionMiddleware, authenticateMiddleware],
    async (req: Request, res: Response) => {
        const user = await UserDao.findById(req.params.id);
        return res.json(user);
    }
);

usersRouter.delete(
    "/:id",
    [exceptionMiddleware, authenticateMiddleware, multerMiddleware.none()],
    async (req: Request, res: Response) => {
        const result = await UserDao.delete(req.params.id);
        res.sendStatus(204);
    }
);

export default usersRouter;
