import { and, eq, like } from "drizzle-orm";
import { Namespace } from "../../domain/models/Namespace.js";
import { joinToNamespaceKey } from "../../utils/bucket-namespace-utils.js";
import { serviceProvider } from "../service-provider.js";
import { ResourceDao } from "./resource-dao.js";

export const NamespaceDao = {
    isEmpty: async (compositeKey: Pick<Namespace, "key" | "userId">) => {
        const { db, resources } = serviceProvider.getDatabase();
        const anyResource = await db.query.resources.findFirst({
            where: and(
                eq(resources.userId, compositeKey.userId),
                like(resources.namespaceKey, `${compositeKey.key}%`)
            ),
            columns: { key: true },
        });
        return !!anyResource;
    },
    findById: (compositeKey: Pick<Namespace, "key" | "userId">) => {
        const { db, namespaces } = serviceProvider.getDatabase();

        return db.query.namespaces.findFirst({
            where: and(
                eq(namespaces.key, compositeKey.key),
                eq(namespaces.userId, compositeKey.userId)
            ),
        });
    },

    findDetailById: (compositeKey: Pick<Namespace, "key" | "userId">) => {
        const { db, namespaces } = serviceProvider.getDatabase();

        return db.query.namespaces.findFirst({
            where: and(
                eq(namespaces.key, compositeKey.key),
                eq(namespaces.userId, compositeKey.userId)
            ),
            with: { namespaces: true, resources: true },
        });
    },

    create: async (data: Omit<Namespace, "parentNamespaceKey">) => {
        const { db, namespaces } = serviceProvider.getDatabase();

        const namespaceParts = data.key.split("/").filter(Boolean);
        const partialPaths = namespaceParts.map((_, i) =>
            joinToNamespaceKey(namespaceParts.slice(0, i + 1))
        );
        partialPaths.unshift("/");

        for (let i = 0; i < partialPaths.length; i++) {
            await db
                .insert(namespaces)
                .values({
                    ...data,
                    key: partialPaths[i],
                    parentNamespaceKey: i === 0 ? null : partialPaths[i - 1],
                })
                .onConflictDoNothing();
        }

        return partialPaths.at(-1);
    },

    update: (data: Namespace) => {
        const { db, namespaces } = serviceProvider.getDatabase();

        return db
            .update(namespaces)
            .set({ parentNamespaceKey: data.parentNamespaceKey })
            .where(and(eq(namespaces.key, data.key), eq(namespaces.userId, data.userId)));
    },

    deleteEmptyNamespaces: async (compositeKey: Pick<Namespace, "key" | "userId">) => {
        const { db, namespaces } = serviceProvider.getDatabase();

        const parts = compositeKey.key.split("/").filter(Boolean);
        const parentNamespaceKeys = parts.map((_, i) => "/" + parts.slice(0, i + 1).join("/"));

        for (const namespaceKey of parentNamespaceKeys) {
            const hasResources = await NamespaceDao.isEmpty({
                key: namespaceKey,
                userId: compositeKey.userId,
            });

            if (!hasResources) {
                await db
                    .delete(namespaces)
                    .where(
                        and(
                            eq(namespaces.key, namespaceKey),
                            eq(namespaces.userId, compositeKey.userId)
                        )
                    );
                break;
            }
        }
    },

    delete: async (compositeKey: Pick<Namespace, "key" | "userId">) => {
        const { db, namespaces } = serviceProvider.getDatabase();

        const resources = await ResourceDao.findAllNested(compositeKey);
        await Promise.all(
            resources.map((resource) =>
                ResourceDao.delete({
                    key: resource.key,
                    namespaceKey: resource.namespaceKey,
                    userId: resource.userId,
                })
            )
        );

        return db
            .delete(namespaces)
            .where(
                and(
                    eq(namespaces.key, compositeKey.key),
                    eq(namespaces.userId, compositeKey.userId)
                )
            );
    },
};
