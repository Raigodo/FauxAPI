import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import "dotenv/config";
import { and, eq, like, or } from "drizzle-orm";
import { Namespace } from "../../domain/models/Namespace.js";
import { Resource } from "../../domain/models/Resource.js";
import { joinToNamespaceKey } from "../../utils/namespace-key-utils.js";
import { serviceProvider } from "../service-provider.js";
import { NamespaceDao } from "./namespace-dao.js";

export const ResourceDao = {
    findAllNested: async (compositeKey: Pick<Namespace, "key" | "userId">) => {
        const { db, resources } = serviceProvider.getDatabase();
        return db.query.resources.findMany({
            where: or(
                eq(resources.userId, compositeKey.userId),
                like(resources.namespaceKey, `${compositeKey.key}%`)
            ),
        });
    },
    findById: (compositeKey: Pick<Resource, "key" | "namespaceKey" | "userId">) => {
        const { db, resources } = serviceProvider.getDatabase();

        return db.query.resources.findFirst({
            where: and(
                eq(resources.key, compositeKey.key),
                eq(resources.namespaceKey, compositeKey.namespaceKey),
                eq(resources.userId, compositeKey.userId)
            ),
        });
    },
    findDetailById: async (compositeKey: Pick<Resource, "key" | "namespaceKey" | "userId">) => {
        const { db, resources } = serviceProvider.getDatabase();

        const model = await db.query.resources.findFirst({
            where: and(
                eq(resources.key, compositeKey.key),
                eq(resources.namespaceKey, compositeKey.namespaceKey),
                eq(resources.userId, compositeKey.userId)
            ),
        });
        if (!model) {
            return null;
        }

        let url: string | undefined;
        let payload: unknown | undefined;

        const s3 = serviceProvider.getBucket();
        if (model.contentType !== "application/json") {
            url = await s3.getSignedUrl(
                joinToNamespaceKey([
                    compositeKey.userId,
                    compositeKey.namespaceKey,
                    compositeKey.key,
                ])
            );
        } else {
            const obj = await s3.send(
                new GetObjectCommand({
                    Bucket: process.env.BUCKET_RESOURCES,
                    Key: joinToNamespaceKey([
                        compositeKey.userId,
                        compositeKey.namespaceKey,
                        compositeKey.key,
                    ]),
                })
            );

            let data: string;
            if (obj.Body && typeof obj.Body.transformToString === "function") {
                data = await obj.Body.transformToString();
            } else if (Buffer.isBuffer(obj.Body)) {
                data = obj.Body.toString("utf-8");
            } else if (typeof obj.Body === "string") {
                data = obj.Body;
            } else {
                throw new Error("Unsupported body type");
            }

            payload = JSON.parse(data);
        }

        return { ...model, url, payload };
    },
    create: async (data: Resource & { payload: Buffer | string }) => {
        const { db, resources } = serviceProvider.getDatabase();
        const s3 = serviceProvider.getBucket();

        const namespaceKey = await NamespaceDao.create({
            key: data.namespaceKey,
            userId: data.userId,
        });

        if (!namespaceKey) throw Error("failed to create namespaces for resource");

        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.BUCKET_RESOURCES,
                Key: joinToNamespaceKey([data.userId, namespaceKey, data.key]),
                Body: data.payload,
                ContentType: data.contentType,
            })
        );

        const dataToInsert = { ...data, namespaceKey: namespaceKey! };

        return await db
            .insert(resources)
            .values(dataToInsert)
            .onConflictDoUpdate({
                target: [resources.key, resources.namespaceKey, resources.userId],
                set: dataToInsert,
            });
    },
    update: (
        compositeKey: Pick<Resource, "key" | "namespaceKey" | "userId">,
        data: Pick<Resource, "userId">
    ) => {
        const { db, resources } = serviceProvider.getDatabase();
        return db
            .update(resources)
            .set({ userId: data.userId })
            .where(
                and(
                    eq(resources.key, compositeKey.key),
                    eq(resources.namespaceKey, compositeKey.namespaceKey),
                    eq(resources.userId, compositeKey.userId)
                )
            );
    },
    delete: async (compositeKey: Pick<Resource, "key" | "namespaceKey" | "userId">) => {
        const { db, resources } = serviceProvider.getDatabase();
        const s3 = serviceProvider.getBucket();
        await s3.send(
            new DeleteObjectCommand({
                Bucket: process.env.BUCKET_RESOURCES,
                Key: joinToNamespaceKey([
                    compositeKey.userId,
                    compositeKey.namespaceKey,
                    compositeKey.key,
                ]),
            })
        );
        return await db
            .delete(resources)
            .where(
                and(
                    eq(resources.key, compositeKey.key),
                    eq(resources.namespaceKey, compositeKey.namespaceKey),
                    eq(resources.userId, compositeKey.userId)
                )
            );
    },
};
