import s3Client from "#bucket.js";
import db from "#database.js";
import express from "express";

const app = express();
const port = process.env.PORT ?? "9001";

s3Client;
db;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
