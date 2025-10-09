import namespaceRouter from "#http/routes/namespace.js";
import resourceRouter from "#http/routes/resource.js";
import usersRouter from "#http/routes/user.js";
import s3 from "#infrastructure/bucket/client.js";
import db from "#infrastructure/database/client.js";
import express from "express";

const app = express();
const port = process.env.PORT ?? "9001";

s3;
db;

app.use("/api/users", usersRouter);
app.use("/api/resources", resourceRouter);
app.use("/api/namespace", namespaceRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
