import express from "express";
import authRouter from "./http/routes/auth.js";
import namespaceRouter from "./http/routes/namespace.js";
import resourceRouter from "./http/routes/resource.js";
import usersRouter from "./http/routes/user.js";

const app = express();

app.use(express.json());
express.urlencoded();

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/resources", resourceRouter);
app.use("/api/namespaces", namespaceRouter);

app.get("/", (req, res) => {
    res.send("FauxAPI is running");
});

export default app;
