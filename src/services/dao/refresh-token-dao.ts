import { eq } from "drizzle-orm";
import { RefreshToken } from "../../domain/models/RefreshToken.js";
import { serviceProvider } from "../service-provider.js";

export const RefreshTokenDao = {
    findByUserId: (userId: RefreshToken["userId"]) => {
        const { db, refreshTokens } = serviceProvider.getDatabase();
        return db.query.refreshTokens.findFirst({ where: eq(refreshTokens.userId, userId) });
    },
    findByValue: (token: RefreshToken["token"]) => {
        const { db, refreshTokens } = serviceProvider.getDatabase();
        return db.query.refreshTokens.findFirst({ where: eq(refreshTokens.token, token) });
    },
    upsert: async (data: RefreshToken) => {
        const { db, refreshTokens } = serviceProvider.getDatabase();
        const existing = await db.query.refreshTokens.findFirst({
            where: eq(refreshTokens.userId, data.userId),
        });
        if (existing) {
            await db
                .update(refreshTokens)
                .set({ token: data.token })
                .where(eq(refreshTokens.userId, data.userId));
        } else {
            await db.insert(refreshTokens).values(data);
        }
    },
    delete: (userId: RefreshToken["userId"]) => {
        const { db, refreshTokens } = serviceProvider.getDatabase();
        return db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
    },
};
