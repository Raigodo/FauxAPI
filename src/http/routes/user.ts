import { Router } from "express";
import { UserDao } from "../../services/dao/user-dao.js";
import { authenticateMiddleware } from "../middleware/authenticate.js";
import { multerMiddleware } from "../middleware/multer.js";

const usersRouter = Router();

usersRouter.get("/", authenticateMiddleware, async (req, res) => {
    const users = await UserDao.all();
    return res.json(users);
});

usersRouter.get("/:id", authenticateMiddleware, async (req, res) => {
    const user = await UserDao.findById(req.params.id);
    return res.json(user);
});

usersRouter.delete("/:id", authenticateMiddleware, multerMiddleware.none(), async (req, res) => {
    const result = await UserDao.delete(req.params.id);
    res.sendStatus(204);
});

export default usersRouter;
