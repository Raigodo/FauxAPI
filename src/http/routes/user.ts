import { Router } from "express";

const usersRouter = Router();

usersRouter.get("/", async (req, res) => {
  return res.status(200).send([]);
});

usersRouter.get("/:id", async (req, res) => {
  return res.status(200).send();
});

usersRouter.post("/", async (req, res) => {
  res.status(200).send();
});

export default usersRouter;
