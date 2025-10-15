import "dotenv/config";
import app from "./app.js";

const port = process.env.PORT ?? "9001";

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
