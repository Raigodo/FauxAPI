import { User } from "#domain/models/User.js";
import { serviceProvider } from "#services/service-provider.js";
import { eq } from "drizzle-orm";
import { NamespaceDao } from "./namespace-dao.js";

export const UserDao = {
    all: () => {
        const { db, userTable } = serviceProvider.getDatabase();
        return db.select().from(userTable);
    },
    findById: (id: User["id"]) => {
        const { db, userTable } = serviceProvider.getDatabase();
        return db
            .select()
            .from(userTable)
            .where(eq(userTable.id, id))
            .then((rows) => rows[0] ?? null);
    },
    findByUsername: (username: User["username"]) => {
        const { db, userTable } = serviceProvider.getDatabase();
        console.log(userTable);

        return db
            .select()
            .from(userTable)
            .where(eq(userTable.username, username))
            .then((rows) => rows[0] ?? null);
    },
    findDetailById: (id: User["id"]) => {
        const { db, userTable } = serviceProvider.getDatabase();
        return db
            .select()
            .from(userTable)
            .where(eq(userTable.id, id))
            .then((rows) => rows[0] ?? null);
    },
    findDetailByUsername: (username: User["username"]) => {
        const { db, userTable, namespaceTable } = serviceProvider.getDatabase();
        return db
            .select()
            .from(userTable)
            .innerJoin(namespaceTable, eq(namespaceTable.userId, userTable.id))
            .where(eq(userTable.username, username))
            .then((rows) => rows[0] ?? null);
    },
    create: (data: User) => {
        const { db, userTable } = serviceProvider.getDatabase();
        return db.insert(userTable).values(data);
    },
    update: (data: Pick<User, "username" | "id">) => {
        const { db, userTable } = serviceProvider.getDatabase();
        return db
            .update(userTable)
            .set({ username: data.username })
            .where(eq(userTable.id, data.id));
    },
    delete: async (id: User["id"]) => {
        const { db, userTable } = serviceProvider.getDatabase();
        const namespaces = await NamespaceDao.findRootsByUserId(id);
        await Promise.all(namespaces.map((namespace) => NamespaceDao.delete(namespace.id)));
        return await db.delete(userTable).where(eq(userTable.id, id));
    },
};
