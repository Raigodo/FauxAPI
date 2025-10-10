import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schemas from "./schema.js";

const db = drizzle(process.env.DATABASE_URL!, {
    logger: true,
    schema: schemas,
});

// await seed(db, { userTable }, { count: 1 });

export default db;
