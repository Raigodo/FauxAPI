import "dotenv/config";
import { Request, Response, Router } from "express";
import { NamespaceDao } from "../../services/dao/namespace-dao.js";
import { ResourceDao } from "../../services/dao/resource-dao.js";
import { joinToNamespaceKey } from "../../utils/namespace-key-utils.js";
import { authenticateMiddleware } from "../middleware/authenticate.js";
import { exceptionMiddleware } from "../middleware/exception-middleware.js";
import { multerMiddleware } from "../middleware/multer.js";

const resourceRouter = Router();

resourceRouter.get(
    "/*wildcard",
    [exceptionMiddleware, authenticateMiddleware],
    // @ts-expect-error
    async (req: Request<{ wildcard: string[] }>, res) => {
        const wildcard = req.params.wildcard;
        if (wildcard.length <= 0) {
            res.sendStatus(400);
            return;
        }
        const namespaceKey = joinToNamespaceKey(wildcard.slice(0, -1));
        const key = wildcard.at(-1)!;

        const resource = await ResourceDao.findDetailById({
            key,
            namespaceKey,
            userId: req.session.userId,
        });

        if (!resource) {
            res.sendStatus(404);
            return;
        }

        res.json(resource);
    }
);

resourceRouter.put(
    "/*wildcard",
    [exceptionMiddleware, authenticateMiddleware, multerMiddleware.single("file")],
    // @ts-expect-error
    async (req: Request<{ wildcard: string[] }>, res: Response) => {
        const wildcard = req.params.wildcard;
        if (wildcard.length <= 0) {
            res.sendStatus(400);
            return;
        }
        const namespaceKey = joinToNamespaceKey(wildcard.slice(0, -1));
        const key = wildcard.at(-1)!;

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

        await ResourceDao.create({
            key,
            namespaceKey,
            userId: req.session.userId,
            contentType,
            payload: body,
        });

        res.sendStatus(204);
    }
);

resourceRouter.delete(
    "/*wildcard",
    [exceptionMiddleware, authenticateMiddleware],
    // @ts-expect-error
    async (req: Request<{ wildcard: string[] }>, res) => {
        const wildcard = req.params.wildcard;
        if (wildcard.length <= 0) {
            res.sendStatus(400);
            return;
        }
        const namespaceKey = joinToNamespaceKey(wildcard.slice(0, -1));
        const key = wildcard.at(-1)!;

        const result = await ResourceDao.delete({ key, namespaceKey, userId: req.session.userId });
        await NamespaceDao.deleteEmptyNamespaces({ key: namespaceKey, userId: req.session.userId });

        res.sendStatus(204);
    }
);

export default resourceRouter;
