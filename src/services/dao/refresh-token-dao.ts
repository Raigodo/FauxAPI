import { RefreshToken } from "#domain/models/RefreshToken.js";
import db from "#infrastructure/database/client.js";
import { refreshTokenTable, userTable } from "#infrastructure/database/schema.js";
import { eq } from "drizzle-orm";

export const RefreshTokenDao = {
    findByUserId: (userId: RefreshToken["userId"]) => {
        return db
            .select()
            .from(refreshTokenTable)
            .where(eq(refreshTokenTable.userId, userId))
            .then((rows) => rows[0] ?? null);
    },
    findByValue: (token: RefreshToken["token"]) => {
        return db
            .select()
            .from(refreshTokenTable)
            .where(eq(refreshTokenTable.token, token))
            .then((rows) => rows[0] ?? null);
    },
    upsert: (data: RefreshToken) => {
        return db.insert(refreshTokenTable).values(data).onConflictDoUpdate({
            target: refreshTokenTable.userId,
            set: data,
        });
    },
    delete: (userId: RefreshToken["userId"]) => {
        return db.delete(userTable).where(eq(userTable.id, userId));
    },
};
