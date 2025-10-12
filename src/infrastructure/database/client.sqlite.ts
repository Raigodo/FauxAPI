import * as schemas from "#infrastructure/database/schema.sqlite.js";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

export function createSqliteClient() {
    const client = createClient({ url: ":memory:" });
    let db = drizzle(client, { schema: schemas, logger: true });

    return {
        client,
        db,
        userTable: schemas.userTable,
        namespaceTable: schemas.namespaceTable,
        refreshTokenTable: schemas.refreshTokenTable,
        resourceTable: schemas.resourceTable,
    };
}
