import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schemas from "./schema.pg.js";

const db = drizzle(process.env.DATABASE_URL!, {
    logger: true,
    schema: schemas,
});

export default {
    db,
    userTable: schemas.userTable,
    namespaceTable: schemas.namespaceTable,
    refreshTokenTable: schemas.refreshTokenTable,
    resourceTable: schemas.resourceTable,
};
