import { relations } from "drizzle-orm";
import { pgTable, varchar } from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
    id: varchar("id").primaryKey(),
    nickname: varchar("nickname").notNull(),
    username: varchar("username").notNull(),
    password: varchar("password").notNull(),
});

export const refreshTokenTable = pgTable("refresh_tokens", {
    userId: varchar("user_id")
        .primaryKey()
        .references(() => userTable.id, { onDelete: "cascade" }),
    token: varchar("value").notNull().unique(),
});

export const namespaceTable = pgTable("namespaces", {
    id: varchar("id").primaryKey(),
    userId: varchar("user_id")
        .notNull()
        .references(() => userTable.id, { onDelete: "restrict" }),
});

export const resourceTable = pgTable("resources", {
    id: varchar("id").notNull(),
    contentType: varchar("content_type").notNull(),
    namespaceId: varchar("namespace_id")
        .notNull()
        .references(() => namespaceTable.id, { onDelete: "restrict" }),
    userId: varchar("user_id")
        .notNull()
        .references(() => userTable.id, { onDelete: "restrict" }),
});

//

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
