import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable("users", {
    id: text("id").primaryKey(),
    nickname: text("nickname").notNull(),
    username: text("username").notNull(),
    password: text("password").notNull(),
});

export const refreshTokenTable = sqliteTable("refresh_tokens", {
    userId: text("user_id")
        .primaryKey()
        .references(() => userTable.id, { onDelete: "cascade" }),
    token: text("value").notNull().unique(),
});

export const namespaceTable = sqliteTable("namespaces", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => userTable.id, { onDelete: "restrict" }),
});

export const resourceTable = sqliteTable("resources", {
    id: text("id").notNull(),
    contentType: text("content_type").notNull(),
    namespaceId: text("namespace_id")
        .notNull()
        .references(() => namespaceTable.id, { onDelete: "restrict" }),
    userId: text("user_id")
        .notNull()
        .references(() => userTable.id, { onDelete: "restrict" }),
});

// Relations (same as Postgres)
export const usersRelations = relations(userTable, ({ many }) => ({
    namespaces: many(namespaceTable),
    resources: many(resourceTable),
}));

export const refreshTokenRelations = relations(refreshTokenTable, ({ one }) => ({
    user: one(userTable, { fields: [refreshTokenTable.userId], references: [userTable.id] }),
}));

export const namespacesRelations = relations(namespaceTable, ({ one, many }) => ({
    user: one(userTable, { fields: [namespaceTable.userId], references: [userTable.id] }),
    resources: many(resourceTable),
}));

export const resourcesRelations = relations(resourceTable, ({ one }) => ({
    namespace: one(namespaceTable, {
        fields: [resourceTable.namespaceId],
        references: [namespaceTable.id],
    }),
    user: one(userTable, { fields: [resourceTable.userId], references: [userTable.id] }),
}));
