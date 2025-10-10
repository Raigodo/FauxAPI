import { multerMiddleware } from "#http/middleware/multer.js";
import { UserDao } from "#services/dao/user-dao.js";
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";

const usersRouter = Router();

usersRouter.get("/", async (req, res) => {
    const users = await UserDao.all();
    return res.status(200).json(users);
});

usersRouter.get("/:id", async (req, res) => {
    const user = await UserDao.findById(req.params.id);
    return res.status(200).json(user);
});

usersRouter.post("/", multerMiddleware.none(), async (req, res) => {
    const result = await UserDao.create({
        id: uuidv4(),
        nickname: req.body.nickname,
        username: req.body.username,
        password: req.body.password,
    });
    res.status(204).send();
});

usersRouter.delete("/:id", multerMiddleware.none(), async (req, res) => {
    const result = await UserDao.delete(req.params.id);
    res.status(204).send();
});

export default usersRouter;
