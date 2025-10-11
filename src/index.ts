import app from "#app.js";
import "dotenv/config";

const port = process.env.PORT ?? "9001";

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
