import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schemas from "./schema.sqlite.js";

export function createSqliteClient() {
    const client = createClient({ url: ":memory:" });
    let db = drizzle(client, { schema: schemas, logger: false });

    return {
        client,
        db,
        userTable: schemas.userTable,
        namespaceTable: schemas.namespaceTable,
        refreshTokenTable: schemas.refreshTokenTable,
        resourceTable: schemas.resourceTable,
    };
}
