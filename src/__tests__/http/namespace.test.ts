import { migrate } from "drizzle-orm/libsql/migrator";
import supertest from "supertest";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../../app.js";
import fakeS3 from "../../infrastructure/bucket/client.fake.js";
import { createSqliteClient } from "../../infrastructure/database/client.sqlite.js";
import { serviceProvider } from "../../services/service-provider.js";

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

describe("Namespace behavior", () => {
    it("should create all intermediate namespaces when storing a deep resource", async () => {
        const { accessToken } = await createUserAndLogin();

        await supertest(app)
            .put("/api/resources/a/b/c/d/value")
            .set("Authorization", `Bearer ${accessToken}`)
            .field("data", JSON.stringify({ text: "deep resource" }))
            .expect(204);

        // Check that all intermediate namespaces exist
        const resA = await supertest(app)
            .get("/api/namespaces/a")
            .set("Authorization", `Bearer ${accessToken}`);
        expect(resA.status).toBe(200);

        const resAB = await supertest(app)
            .get("/api/namespaces/a/b")
            .set("Authorization", `Bearer ${accessToken}`);
        expect(resAB.status).toBe(200);

        const resABC = await supertest(app)
            .get("/api/namespaces/a/b/c")
            .set("Authorization", `Bearer ${accessToken}`);
        expect(resABC.status).toBe(200);

        const resABCD = await supertest(app)
            .get("/api/namespaces/a/b/c/d")
            .set("Authorization", `Bearer ${accessToken}`);
        expect(resABCD.status).toBe(200);
    });

    it("should delete namespace recursively", async () => {
        const { accessToken } = await createUserAndLogin();

        // Create deep resource
        await supertest(app)
            .put("/api/resources/a/b/c/d/value")
            .set("Authorization", `Bearer ${accessToken}`)
            .field("data", JSON.stringify({ text: "deep resource" }))
            .expect(204);

        // Delete /a/b namespace
        await supertest(app)
            .delete("/api/namespaces/a/b")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(204);

        // /a should remain
        const resA = await supertest(app)
            .get("/api/namespaces/a")
            .set("Authorization", `Bearer ${accessToken}`);
        expect(resA.status).toBe(200);

        // All deleted namespaces and resources should be gone
        const deletedPaths = ["/a/b", "/a/b/c", "/a/b/c/d"];
        for (const path of deletedPaths) {
            const res = await supertest(app)
                .get(`/api/namespaces${path}`)
                .set("Authorization", `Bearer ${accessToken}`);
            expect(res.status).toBe(404);
        }
    });
});
