import { authenticateMiddleware } from "#http/middleware/authenticate.js";
import { NamespaceDao } from "#services/dao/namespace-dao.js";
import { Request, Router } from "express";

const namespaceRouter = Router();

namespaceRouter.get(
    "/*wildcard",
    authenticateMiddleware,
    // @ts-expect-error
    async (req: Request<{ wildcard: string[] }>, res) => {
        const wildcard = req.params.wildcard;
        if (wildcard.length <= 0) {
            res.sendStatus(400);
            return;
        }
        const namespaceId = "/" + wildcard.join("/");

        const namespace = await NamespaceDao.findById(namespaceId);

        res.json(namespace);
    }
);

namespaceRouter.delete(
    "/*wildcard",
    authenticateMiddleware,
    // @ts-expect-error
    async (req: Request<{ wildcard: string[] }>, res) => {
        const wildcard = req.params.wildcard;
        if (wildcard.length <= 0) {
            res.sendStatus(400);
            return;
        }
        const namespaceId = "/" + wildcard.join("/");

        const result = await NamespaceDao.delete(namespaceId);

        res.sendStatus(204);
    }
);

export default namespaceRouter;
