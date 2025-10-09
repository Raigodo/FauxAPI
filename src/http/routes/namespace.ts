import { Request, Router } from "express";

const namespaceRouter = Router();

namespaceRouter.get("/*wildcard", async (req: Request<{ wildcard: string[] }>, res) => {
  const wildcard = req.params.wildcard;
  if (wildcard.length <= 0) {
    res.status(400);
    return;
  }
  const namespace = "/" + wildcard.join("/");
  res.status(200).send({});
});

namespaceRouter.delete("/*wildcard", async (req: Request<{ wildcard: string[] }>, res) => {
  const wildcard = req.params.wildcard;
  if (wildcard.length <= 0) {
    res.status(400);
    return;
  }
  const namespace = "/" + wildcard.join("/");
  res.status(200).send();
});

export default namespaceRouter;
