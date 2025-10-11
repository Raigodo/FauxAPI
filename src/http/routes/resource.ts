import { authenticateMiddleware } from "#http/middleware/authenticate.js";
import { multerMiddleware } from "#http/middleware/multer.js";
import { NamespaceDao } from "#services/dao/namespace-dao.js";
import { ResourceDao } from "#services/dao/resource-dao.js";
import { UserDao } from "#services/dao/user-dao.js";
import { Request, Response, Router } from "express";

const resourceRouter = Router();

resourceRouter.get(
    "/*wildcard",
    authenticateMiddleware,
    // @ts-expect-error
    async (req: Request<{ wildcard: string[] }>, res) => {
        const wildcard = req.params.wildcard;
        if (wildcard.length <= 0) {
            res.sendStatus(400);
            return;
        }
        const namespaceId = "/" + wildcard.slice(0, -1).join("/");
        const key = wildcard.at(-1)!;

        const resource = await ResourceDao.findById({ id: key, namespaceId });

        res.json(resource);
    }
);

resourceRouter.put(
    "/*wildcard",
    [authenticateMiddleware, multerMiddleware.single("file")],
    // @ts-expect-error
    async (req: Request<{ wildcard: string[] }>, res: Response) => {
        const wildcard = req.params.wildcard;
        if (wildcard.length <= 0) {
            res.sendStatus(400);
            return;
        }
        const namespaceId = "/" + wildcard.slice(0, -1).join("/");
        const key = wildcard.at(-1)!;

        const user = (await UserDao.all())[0]!;

        const namespace = await NamespaceDao.findById(namespaceId);
        if (!namespace) {
            await NamespaceDao.create({ id: namespaceId, userId: user.id });
        }

        const result = await ResourceDao.create({
            id: key,
            namespaceId,
            userId: user.id,
            contentType: "nothing for now",
        });

        res.sendStatus(204);
    }
);

resourceRouter.delete(
    "/*wildcard",
    authenticateMiddleware,
    // @ts-expect-error
    async (req: Request<{ wildcard: string[] }>, res) => {
        const wildcard = req.params.wildcard;
        if (wildcard.length <= 0) {
            res.sendStatus(400);
            return;
        }
        const namespaceId = "/" + wildcard.slice(0, -1).join("/");
        const key = wildcard.at(-1)!;

        const result = await ResourceDao.delete({ id: key, namespaceId });

        res.sendStatus(204);
    }
);

export default resourceRouter;
