import namespaceRouter from "#http/routes/namespace.js";
import resourceRouter from "#http/routes/resource.js";
import usersRouter from "#http/routes/user.js";
import "dotenv/config";
import express from "express";

const app = express();
const port = process.env.PORT ?? "9001";

app.use(express.json());
express.urlencoded();

app.use("/api/users", usersRouter);
app.use("/api/resources", resourceRouter);
app.use("/api/namespace", namespaceRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
