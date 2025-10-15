import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { Resource } from "../../domain/models/Resource.js";
import { serviceProvider } from "../service-provider.js";

export const ResourceDao = {
    findByNamespaceId: (namespaceId: Resource["namespaceId"]) => {
        const { db, resourceTable } = serviceProvider.getDatabase();
        return db.select().from(resourceTable).where(eq(resourceTable.namespaceId, namespaceId));
    },
    findById: (params: { id: Resource["id"]; namespaceId: Resource["namespaceId"] }) => {
        const { db, resourceTable } = serviceProvider.getDatabase();
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
    findDetailById: async (params: {
        id: Resource["id"];
        namespaceId: Resource["namespaceId"];
    }) => {
        const { db, resourceTable } = serviceProvider.getDatabase();

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

        let url: string | undefined;
        let payload: unknown | undefined;

        if (!model) {
            return null;
        }

        const s3 = serviceProvider.getBucket();
        if (model.contentType !== "application/json") {
            url = await s3.getSignedUrl(`${params.namespaceId}/${params.id}`);
        } else {
            const obj = await s3.send(
                new GetObjectCommand({
                    Bucket: process.env.BUCKET_RESOURCES,
                    Key: `${model.namespaceId}/${model.id}`,
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
        const { db, resourceTable } = serviceProvider.getDatabase();
        const s3 = serviceProvider.getBucket();
        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.BUCKET_RESOURCES,
                Key: `${data.namespaceId}/${data.id}`,
                Body: data.payload,
                ContentType: data.contentType,
            })
        );
        return await db.insert(resourceTable).values(data);
    },
    update: (data: Pick<Resource, "id" | "userId" | "namespaceId">) => {
        const { db, resourceTable } = serviceProvider.getDatabase();
        return db
            .update(resourceTable)
            .set({ userId: data.userId })
            .where(
                and(eq(resourceTable.id, data.id), eq(resourceTable.namespaceId, data.namespaceId))
            );
    },
    delete: async (params: { id: Resource["id"]; namespaceId: Resource["namespaceId"] }) => {
        const { db, resourceTable } = serviceProvider.getDatabase();
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
