import { and, eq, like, ne, notLike, sql } from "drizzle-orm";
import { Namespace } from "../../domain/models/Namespace.js";
import { serviceProvider } from "../service-provider.js";
import { ResourceDao } from "./resource-dao.js";

export const NamespaceDao = {
    findChildren: (id: Namespace["id"]) => {
        const { db, namespaceTable } = serviceProvider.getDatabase();
        return db
            .select()
            .from(namespaceTable)
            .where(and(like(namespaceTable.id, `${id}%`), ne(namespaceTable.id, id)));
    },
    findRootsByUserId: (userId: Namespace["userId"]) => {
        const { db, namespaceTable } = serviceProvider.getDatabase();
        return db
            .select()
            .from(namespaceTable)
            .where(and(eq(namespaceTable.userId, userId), eq(namespaceTable.id, "/")));
    },
    findById: (id: Namespace["id"]) => {
        const { db, namespaceTable } = serviceProvider.getDatabase();
        return db
            .select()
            .from(namespaceTable)
            .where(eq(namespaceTable.id, id))
            .then((rows) => rows[0] ?? null);
    },
    findDetailById: (id: Namespace["id"]) => {
        const { db, namespaceTable } = serviceProvider.getDatabase();
        return db
            .select()
            .from(namespaceTable)
            .leftJoinLateral(
                db
                    .select()
                    .from(namespaceTable)
                    .where(
                        and(
                            like(namespaceTable.id, `${id}/%`),
                            notLike(namespaceTable.id, `${id}/%/%`)
                        )
                    )
                    .as("parentNamespaces"),
                sql`true`
            )
            .where(eq(namespaceTable.id, id))
            .then((rows) => rows[0] ?? null);
    },
    create: (data: Namespace) => {
        const { db, namespaceTable } = serviceProvider.getDatabase();
        return db.insert(namespaceTable).values(data);
    },
    update: (data: Pick<Namespace, "id" | "userId">) => {
        const { db, namespaceTable } = serviceProvider.getDatabase();
        return db
            .update(namespaceTable)
            .set({ userId: data.userId })
            .where(eq(namespaceTable.id, data.id));
    },
    delete: async (id: Namespace["id"]) => {
        const { db, namespaceTable } = serviceProvider.getDatabase();

        const resources = await ResourceDao.findByNamespaceId(id);
        await Promise.all(
            resources.map((resource) =>
                ResourceDao.delete({ id: resource.id, namespaceId: resource.namespaceId })
            )
        );

        const children = await NamespaceDao.findChildren(id);
        await Promise.all(
            children.map(async (namespace) => {
                const childResources = await ResourceDao.findByNamespaceId(namespace.id);
                await Promise.all(
                    childResources.map((resource) =>
                        ResourceDao.delete({ id: resource.id, namespaceId: resource.namespaceId })
                    )
                );
            })
        );

        return db.delete(namespaceTable).where(eq(namespaceTable.id, id));
    },
};
