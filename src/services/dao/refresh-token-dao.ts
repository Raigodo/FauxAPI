import { eq } from "drizzle-orm";
import { RefreshToken } from "../../domain/models/RefreshToken.js";
import { serviceProvider } from "../service-provider.js";

export const RefreshTokenDao = {
    findByUserId: (userId: RefreshToken["userId"]) => {
        const { db, refreshTokenTable } = serviceProvider.getDatabase();
        return db
            .select()
            .from(refreshTokenTable)
            .where(eq(refreshTokenTable.userId, userId))
            .then((rows) => rows[0] ?? null);
    },
    findByValue: (token: RefreshToken["token"]) => {
        const { db, refreshTokenTable } = serviceProvider.getDatabase();
        return db
            .select()
            .from(refreshTokenTable)
            .where(eq(refreshTokenTable.token, token))
            .then((rows) => rows[0] ?? null);
    },
    upsert: async (data: RefreshToken) => {
        const { db, refreshTokenTable } = serviceProvider.getDatabase();
        const existing = await db
            .select()
            .from(refreshTokenTable)
            .where(eq(refreshTokenTable.userId, data.userId));

        if (existing.length > 0) {
            await db
                .update(refreshTokenTable)
                .set({ token: data.token })
                .where(eq(refreshTokenTable.userId, data.userId));
        } else {
            await db.insert(refreshTokenTable).values(data);
        }
    },
    delete: (userId: RefreshToken["userId"]) => {
        const { db, userTable } = serviceProvider.getDatabase();
        return db.delete(userTable).where(eq(userTable.id, userId));
    },
};
