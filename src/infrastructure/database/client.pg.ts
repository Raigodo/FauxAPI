import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schemas from "./schema.pg.js";

const client = drizzle(process.env.DATABASE_URL!, {
    logger: true,
    schema: schemas,
});

const db = {
    db: client,
    users: schemas.users,
    namespaces: schemas.namespaces,
    refreshTokens: schemas.refreshTokens,
    resources: schemas.resources,
};

export default db;
