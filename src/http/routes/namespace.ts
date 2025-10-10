import { NamespaceDao } from "#services/dao/namespace-dao.js";
import { Request, Router } from "express";

const namespaceRouter = Router();

namespaceRouter.get("/*wildcard", async (req: Request<{ wildcard: string[] }>, res) => {
    const wildcard = req.params.wildcard;
    if (wildcard.length <= 0) {
        res.status(400);
        return;
    }
    const namespaceId = "/" + wildcard.join("/");

    const namespace = await NamespaceDao.findById(namespaceId);

    res.status(200).json(namespace);
});

namespaceRouter.delete("/*wildcard", async (req: Request<{ wildcard: string[] }>, res) => {
    const wildcard = req.params.wildcard;
    if (wildcard.length <= 0) {
        res.status(400);
        return;
    }
    const namespaceId = "/" + wildcard.join("/");

    const result = await NamespaceDao.delete(namespaceId);

    res.status(204).send();
});

export default namespaceRouter;
