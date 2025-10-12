import { RefreshToken } from "#domain/models/RefreshToken.js";
import { refreshTokenTable, userTable } from "#infrastructure/database/schema.pg.js";
import { serviceProvider } from "#services/service-provider.js";
import { eq } from "drizzle-orm";

export const RefreshTokenDao = {
    findByUserId: (userId: RefreshToken["userId"]) => {
        const db = serviceProvider.getDatabase();
        return db
            .select()
            .from(refreshTokenTable)
            .where(eq(refreshTokenTable.userId, userId))
            .then((rows) => rows[0] ?? null);
    },
    findByValue: (token: RefreshToken["token"]) => {
        const db = serviceProvider.getDatabase();
        return db
            .select()
            .from(refreshTokenTable)
            .where(eq(refreshTokenTable.token, token))
            .then((rows) => rows[0] ?? null);
    },
    upsert: (data: RefreshToken) => {
        const db = serviceProvider.getDatabase();
        return db.insert(refreshTokenTable).values(data).onConflictDoUpdate({
            target: refreshTokenTable.userId,
            set: data,
        });
    },
    delete: (userId: RefreshToken["userId"]) => {
        const db = serviceProvider.getDatabase();
        return db.delete(userTable).where(eq(userTable.id, userId));
    },
};
