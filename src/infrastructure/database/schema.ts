import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userTable = pgTable("users", {
  id: varchar("id").primaryKey(),
  nickname: varchar("nickname").notNull(),
  username: varchar("username").notNull(),
  password: varchar("password").notNull(),
});

export const namespaceTable = pgTable("namespaces", {
  id: varchar("id").primaryKey(),
  user_id: varchar("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});

export const resourceTable = pgTable("resources", {
  id: varchar("id").notNull(),
  content_type: varchar("content_type").notNull(),
  namespace_id: varchar("namespace_id")
    .notNull()
    .references(() => namespaceTable.id, { onDelete: "cascade" }),
  user_id: varchar("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});

export const usersRelations = relations(userTable, ({ many }) => ({
  namespaces: many(namespaceTable),
  resources: many(resourceTable),
}));

export const namespacesRelations = relations(namespaceTable, ({ one, many }) => ({
  user: one(userTable, { fields: [namespaceTable.user_id], references: [userTable.id] }),
  resources: many(resourceTable),
}));

export const resourcesRelations = relations(resourceTable, ({ one }) => ({
  namespace: one(namespaceTable, { fields: [resourceTable.namespace_id], references: [namespaceTable.id] }),
  user: one(userTable, { fields: [resourceTable.user_id], references: [userTable.id] }),
}));
