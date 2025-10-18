import { Request, Router } from "express";
import { NamespaceDao } from "../../services/dao/namespace-dao.js";
import { joinToNamespaceKey } from "../../utils/namespace-key-utils.js";
import { authenticateMiddleware } from "../middleware/authenticate.js";

const namespaceRouter = Router();

namespaceRouter.get(
    "/",
    authenticateMiddleware,
    // @ts-expect-error
    async (req: Request<{ wildcard: string[] }>, res) => {
        const namespaceKey = "/";

        const namespace = await NamespaceDao.findDetailById({
            key: namespaceKey,
            userId: req.session.userId,
        });

        res.json(namespace);
    }
);

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
        const namespaceKey = joinToNamespaceKey(wildcard);

        const namespace = await NamespaceDao.findDetailById({
            key: namespaceKey,
            userId: req.session.userId,
        });

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
        const namespaceKey = joinToNamespaceKey(wildcard);

        const result = await NamespaceDao.delete({
            key: namespaceKey,
            userId: req.session.userId,
        });

        res.sendStatus(204);
    }
);

export default namespaceRouter;
