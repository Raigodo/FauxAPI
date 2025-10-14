import { authenticateMiddleware } from "#http/middleware/authenticate.js";
import { multerMiddleware } from "#http/middleware/multer.js";
import { NamespaceDao } from "#services/dao/namespace-dao.js";
import { ResourceDao } from "#services/dao/resource-dao.js";
import { UserDao } from "#services/dao/user-dao.js";
import "dotenv/config";
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

        const resource = await ResourceDao.findDetailById({ id: key, namespaceId });

        if (!resource) {
            res.sendStatus(404);
            return;
        }

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

        const user = await UserDao.findById(req.session.userId);

        let body: Buffer | string;
        let contentType: string;

        if (req.file) {
            contentType = req.file!.mimetype || "application/octet-stream";
            body = req.file.buffer;
        } else if (req.body && Object.keys(req.body).length > 0) {
            contentType = "application/json";
            body = JSON.stringify(req.body, null, 2);
        } else {
            return res.status(400).json({ error: "No file or JSON data provided" });
        }

        let ns = await NamespaceDao.findById(namespaceId);
        if (!ns) {
            await NamespaceDao.create({ id: namespaceId, userId: user.id });
        }

        await ResourceDao.create({
            id: key,
            namespaceId,
            userId: user.id,
            contentType,
            payload: body,
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
