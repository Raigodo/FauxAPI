import { relations } from "drizzle-orm";
import { foreignKey, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"; // use sqlite-core
// Note: In Drizzle, pgTable can be replaced by sqliteTable or pgTable can still work, but for clarity we use sqlite-core here.

export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    nickname: text("nickname").notNull(),
    username: text("username").notNull(),
    password: text("password").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
    namespaces: many(namespaces, { relationName: "owner" }),
    resources: many(resources, { relationName: "creator" }),
}));

export const refreshTokens = sqliteTable("refresh_tokens", {
    userId: text("user_id")
        .primaryKey()
        .references(() => users.id, { onDelete: "cascade" }),
    token: text("value").notNull().unique(),
});

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
    user: one(users, { fields: [refreshTokens.userId], references: [users.id] }),
}));

export const namespaces = sqliteTable(
    "namespaces",
    {
        key: text("key").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "restrict" }),
        parentNamespaceKey: text("parent_namespace_key"),
    },
    (table) => [
        primaryKey({ columns: [table.userId, table.key] }),
        foreignKey({
            columns: [table.userId, table.parentNamespaceKey],
            foreignColumns: [table.userId, table.key],
        }).onDelete("cascade"),
    ]
);

export const namespacesRelations = relations(namespaces, ({ one, many }) => ({
    owner: one(users, {
        fields: [namespaces.userId],
        references: [users.id],
        relationName: "owner",
    }),
    namespaces: many(namespaces, { relationName: "namespace" }),
    namespace: one(namespaces, {
        fields: [namespaces.parentNamespaceKey, namespaces.userId],
        references: [namespaces.key, namespaces.userId],
        relationName: "namespace",
    }),
    resources: many(resources, { relationName: "resource_namespace" }),
}));

export const resources = sqliteTable(
    "resources",
    {
        key: text("key").notNull(),
        contentType: text("content_type").notNull(),
        namespaceKey: text("namespace_key").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "restrict" }),
    },
    (table) => [
        primaryKey({ columns: [table.key, table.namespaceKey, table.userId] }),
        foreignKey({
            columns: [table.userId, table.namespaceKey],
            foreignColumns: [namespaces.userId, namespaces.key],
        }).onDelete("restrict"),
    ]
);

export const resourcesRelations = relations(resources, ({ one }) => ({
    namespace: one(namespaces, {
        fields: [resources.namespaceKey, resources.userId],
        references: [namespaces.key, namespaces.userId],
        relationName: "resource_namespace",
    }),
    creator: one(users, {
        fields: [resources.userId],
        references: [users.id],
        relationName: "creator",
    }),
}));
