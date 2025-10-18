import { relations } from "drizzle-orm";
import { foreignKey, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: varchar("id").primaryKey(),
    nickname: varchar("nickname").notNull(),
    username: varchar("username").notNull(),
    password: varchar("password").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
    namespaces: many(namespaces, { relationName: "owner" }),
    resources: many(resources, { relationName: "creator" }),
}));

export const refreshTokens = pgTable("refresh_tokens", {
    userId: varchar("user_id")
        .primaryKey()
        .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("value").notNull().unique(),
});

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
    user: one(users, { fields: [refreshTokens.userId], references: [users.id] }),
}));

export const namespaces = pgTable(
    "namespaces",
    {
        key: varchar("key").notNull(),
        userId: varchar("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "restrict" }),
        parentNamespaceKey: varchar("parent_namespace_key"),
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

export const resources = pgTable(
    "resources",
    {
        key: varchar("key").notNull(),
        contentType: varchar("content_type").notNull(),
        namespaceKey: varchar("namespace_key").notNull(),
        userId: varchar("user_id")
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
