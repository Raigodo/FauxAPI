import app from "#app.js";
import fakeS3 from "#infrastructure/bucket/client.fake.js";
import { createSqliteClient } from "#infrastructure/database/client.sqlite.js";
import { serviceProvider } from "#services/service-provider.js";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "node:path";
import supertest from "supertest";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

const sqlite = createSqliteClient();

beforeAll(async () => {
    await migrate(sqlite.db, {
        migrationsFolder: "./src/infrastructure/database/migrations_sqlite",
    });
    serviceProvider.set("database", sqlite);
    serviceProvider.set("bucket", fakeS3);
});

beforeEach(async () => {
    await sqlite.client.execute("BEGIN");
});
afterEach(async () => {
    await sqlite.client.execute("ROLLBACK");
});

/**
 * Utility to register and login a new user per test
 * Returns { accessToken }
 */
async function createUserAndLogin(username = `user_${Date.now()}`) {
    await supertest(app).post("/api/auth/register").send({
        nickname: "test user",
        username,
        password: "P@55w0rd",
    });

    const loginRes = await supertest(app).post("/api/auth/login").send({
        username,
        password: "P@55w0rd",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("accessToken");
    expect(loginRes.body).toHaveProperty("refreshToken");
    expect(typeof loginRes.body.accessToken).toBe("string");
    expect(typeof loginRes.body.refreshToken).toBe("string");

    return { accessToken: loginRes.body.accessToken };
}

describe("Resource Routes", () => {
    describe("PUT /put/:namespace*/:key", () => {
        it("should store a JSON resource", async () => {
            const { accessToken } = await createUserAndLogin();
            const res = await supertest(app)
                .put("/api/resources/a/b/c/value")
                .set("Authorization", `Bearer ${accessToken}`)
                .field("data", JSON.stringify({ text: "hello world" }));
            expect(res.status).toBe(204);
        });

        it("should store a text file resource", async () => {
            const { accessToken } = await createUserAndLogin();

            const filePath = path.resolve("./src/__tests__/fixtures/text.txt");

            const res = await supertest(app)
                .put("/api/resources/a/b/c/value")
                .set("Authorization", `Bearer ${accessToken}`)
                .attach("file", filePath);

            expect(res.status).toBe(204);
        });

        it("should store a image file resource", async () => {
            const { accessToken } = await createUserAndLogin();

            const filePath = path.resolve("./src/__tests__/fixtures/img.jpg");

            const res = await supertest(app)
                .put("/api/resources/a/b/c/value")
                .set("Authorization", `Bearer ${accessToken}`)
                .attach("file", filePath);

            expect(res.status).toBe(204);
        });

        it("should reject when not authenticated", async () => {
            const res = await supertest(app)
                .put("/api/resources/a/b/c/value")
                .field("data", JSON.stringify({ text: "should fail" }));

            expect(res.status).toBe(401);
        });
    });

    describe("GET /:namespace*/:key?", () => {
        it("should fetch an existing JSON resource", async () => {
            const { accessToken } = await createUserAndLogin();

            await supertest(app)
                .put("/api/resources/a/b/c/value")
                .set("Authorization", `Bearer ${accessToken}`)
                .field("text", "my data");

            const res = await supertest(app)
                .get("/api/resources/a/b/c/value")
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.payload).toBeDefined();
            expect(res.body.payload.toString()).toBe({ text: "my data" }.toString());
            expect(res.body.url).toBeUndefined();
        });

        it("should fetch an existing JSON resource", async () => {
            const { accessToken } = await createUserAndLogin();

            const filePath = path.resolve("./src/__tests__/fixtures/text.txt");

            await supertest(app)
                .put("/api/resources/a/b/c/value")
                .set("Authorization", `Bearer ${accessToken}`)
                .attach("file", filePath);

            const res = await supertest(app)
                .get("/api/resources/a/b/c/value")
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.payload).toBeUndefined();
            expect(res.body.url).toBeDefined();
        });

        it("test name", async () => {
            const { accessToken } = await createUserAndLogin();

            const filePath = path.resolve("./src/__tests__/fixtures/img.jpg");

            await supertest(app)
                .put("/api/resources/a/b/c/value")
                .set("Authorization", `Bearer ${accessToken}`)
                .attach("file", filePath);

            const res = await supertest(app)
                .get("/api/resources/a/b/c/value")
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.payload).toBeUndefined();
            expect(res.body.url).toBeDefined();
        });

        it("should return 404 for non-existent resource", async () => {
            const { accessToken } = await createUserAndLogin();

            const res = await supertest(app)
                .get("/api/resources/a/b/c/no-value")
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.status).toBe(404);
        });
    });
});
