import { Request, Response, Router } from "express";
import multer from "multer";

const resourceRouter = Router();

const upload = multer({ storage: multer.memoryStorage() });

resourceRouter.post(
  "/*wildcard",
  upload.single("file"),

  // @ts-expect-error
  async (req: Request<{ wildcard: string[] }>, res: Response) => {
    const wildcard = req.params.wildcard;
    if (wildcard.length <= 0) {
      res.status(400);
      return;
    }
    const namespace = "/" + wildcard.slice(0, -1).join("/");
    const key = wildcard.at(-1)!;

    res.status(200).send();
  },
);

resourceRouter.get("/*wildcard", async (req: Request<{ wildcard: string[] }>, res) => {
  const wildcard = req.params.wildcard;
  if (wildcard.length <= 0) {
    res.status(400);
    return;
  }
  const namespace = "/" + wildcard.slice(0, -1).join("/");
  const key = wildcard.at(-1)!;

  res.status(200).send();
});

resourceRouter.delete("/*wildcard", async (req: Request<{ wildcard: string[] }>, res) => {
  const wildcard = req.params.wildcard;
  if (wildcard.length <= 0) {
    res.status(400);
    return;
  }
  const namespace = "/" + wildcard.slice(0, -1).join("/");
  const key = wildcard.at(-1)!;

  res.status(200).send();
});

export default resourceRouter;
