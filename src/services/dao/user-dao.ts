import { User } from "#domain/models/User.js";
import db from "#infrastructure/database/client.js";
import { namespaceTable, userTable } from "#infrastructure/database/schema.js";
import { eq } from "drizzle-orm";
import { NamespaceDao } from "./namespace-dao.js";

export const UserDao = {
    all: () => {
        return db.select().from(userTable);
    },
    findById: (id: User["id"]) => {
        return db
            .select()
            .from(userTable)
            .where(eq(userTable.id, id))
            .then((rows) => rows[0] ?? null);
    },
    findByUsername: (username: User["username"]) => {
        return db
            .select()
            .from(userTable)
            .where(eq(userTable.username, username))
            .then((rows) => rows[0] ?? null);
    },
    findDetailById: (id: User["id"]) => {
        return db
            .select()
            .from(userTable)
            .where(eq(userTable.id, id))
            .then((rows) => rows[0] ?? null);
    },
    findDetailByUsername: (username: User["username"]) => {
        return db
            .select()
            .from(userTable)
            .innerJoin(namespaceTable, eq(namespaceTable.userId, userTable.id))
            .where(eq(userTable.username, username))
            .then((rows) => rows[0] ?? null);
    },
    create: (data: User) => {
        return db.insert(userTable).values(data);
    },
    update: (data: Pick<User, "username" | "id">) => {
        return db
            .update(userTable)
            .set({ username: data.username })
            .where(eq(userTable.id, data.id));
    },
    delete: async (id: User["id"]) => {
        const namespaces = await NamespaceDao.findRootsByUserId(id);
        await Promise.all(namespaces.map((namespace) => NamespaceDao.delete(namespace.id)));
        return await db.delete(userTable).where(eq(userTable.id, id));
    },
};
