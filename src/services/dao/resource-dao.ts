import { Resource } from "#domain/models/Resource.js";
import { resourceTable } from "#infrastructure/database/schema.pg.js";
import { serviceProvider } from "#services/service-provider.js";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import "dotenv/config";
import { and, eq } from "drizzle-orm";

export const ResourceDao = {
    findByNamespaceId: (namespaceId: Resource["namespaceId"]) => {
        const db = serviceProvider.getDatabase();
        return db.select().from(resourceTable).where(eq(resourceTable.namespaceId, namespaceId));
    },
    findById: async (params: { id: Resource["id"]; namespaceId: Resource["namespaceId"] }) => {
        const db = serviceProvider.getDatabase();
        const s3 = serviceProvider.getBucket();
        const command = new GetObjectCommand({
            Bucket: process.env.BUCKET_RESOURCES,
            Key: `${params.namespaceId}/${params.id}`,
        });
        const url = await getSignedUrl(s3, command, { expiresIn: 30 });

        const model = await db
            .select()
            .from(resourceTable)
            .where(
                and(
                    eq(resourceTable.id, params.id),
                    eq(resourceTable.namespaceId, params.namespaceId)
                )
            )
            .then((rows) => rows[0] ?? null);
        return { ...model, url };
    },
    findDetailById: (params: { id: Resource["id"]; namespaceId: Resource["namespaceId"] }) => {
        const db = serviceProvider.getDatabase();
        return db
            .select()
            .from(resourceTable)
            .where(
                and(
                    eq(resourceTable.id, params.id),
                    eq(resourceTable.namespaceId, params.namespaceId)
                )
            )
            .then((rows) => rows[0] ?? null);
    },
    create: async (data: Resource) => {
        const db = serviceProvider.getDatabase();
        const s3 = serviceProvider.getBucket();
        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.BUCKET_RESOURCES,
                Key: `${data.namespaceId}/${data.id}`,
                Body: "Hello World!",
                ContentType: "text/plain",
            })
        );
        return await db.insert(resourceTable).values(data);
    },
    update: (data: Pick<Resource, "id" | "userId" | "namespaceId">) => {
        const db = serviceProvider.getDatabase();
        return db
            .update(resourceTable)
            .set({ userId: data.userId })
            .where(
                and(eq(resourceTable.id, data.id), eq(resourceTable.namespaceId, data.namespaceId))
            );
    },
    delete: async (params: { id: Resource["id"]; namespaceId: Resource["namespaceId"] }) => {
        const db = serviceProvider.getDatabase();
        const s3 = serviceProvider.getBucket();
        await s3.send(
            new DeleteObjectCommand({
                Bucket: process.env.BUCKET_RESOURCES,
                Key: `${params.namespaceId}/${params.id}`,
            })
        );
        return await db
            .delete(resourceTable)
            .where(
                and(
                    eq(resourceTable.id, params.id),
                    eq(resourceTable.namespaceId, params.namespaceId)
                )
            );
    },
};
