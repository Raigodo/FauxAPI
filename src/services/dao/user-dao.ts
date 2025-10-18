import { eq } from "drizzle-orm";
import { User } from "../../domain/models/User.js";
import { serviceProvider } from "../service-provider.js";

export const UserDao = {
    all: () => {
        const { db } = serviceProvider.getDatabase();
        return db.query.users.findMany();
    },
    findById: (id: User["id"]) => {
        const { db, users } = serviceProvider.getDatabase();
        return db.query.users.findFirst({ where: eq(users.id, id) });
    },
    findByUsername: (username: User["username"]) => {
        const { db, users } = serviceProvider.getDatabase();
        return db.query.users.findFirst({ where: eq(users.username, username) });
    },
    findDetailById: (id: User["id"]) => {
        const { db, users } = serviceProvider.getDatabase();
        return db.query.users.findFirst({ where: eq(users.id, id) });
    },
    findDetailByUsername: (username: User["username"]) => {
        const { db, users } = serviceProvider.getDatabase();
        return db.query.users.findFirst({ where: eq(users.username, username) });
    },
    create: (data: User) => {
        const { db, users } = serviceProvider.getDatabase();
        return db.insert(users).values(data);
    },
    update: (data: Pick<User, "username" | "id">) => {
        const { db, users } = serviceProvider.getDatabase();
        return db.update(users).set({ username: data.username }).where(eq(users.id, data.id));
    },
    delete: async (id: User["id"]) => {
        const { db, users } = serviceProvider.getDatabase();
        // const resources = await ResourceDao.findAllByUserId(id);
        // await Promise.all(
        //     resources.map((resource) =>
        //         ResourceDao.delete({ key: resources.key, userId: resources.userId })
        //     )
        // );
        return await db.delete(users).where(eq(users.id, id));
    },
};
