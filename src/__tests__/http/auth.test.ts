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

describe("Auth Routes", () => {
    describe("POST /register", () => {
        it("should respond 204 on successful registration", async () => {
            const response = await supertest(app).post("/api/auth/register").send({
                nickname: "user one",
                username: "myusername",
                password: "P@55w0rd",
            });

            expect(response.status).toBe(204);
        });

        it("should respond 400 if missing fields", async () => {
            const response = await supertest(app)
                .post("/api/auth/register")
                .send({ username: "user2" });
            expect(response.status).toBe(400);
        });

        it("should respond 400 if username already exists", async () => {
            await supertest(app).post("/api/auth/register").send({
                nickname: "user one",
                username: "myusername",
                password: "P@55w0rd",
            });
            const response = await supertest(app).post("/api/auth/register").send({
                nickname: "user two",
                username: "myusername",
                password: "P@55w0rd",
            });
            expect(response.status).toBe(400);
        });
    });

    describe("POST /login", () => {
        it("should respond with accessToken & refreshToken on valid login", async () => {
            await supertest(app).post("/api/auth/register").send({
                nickname: "user one",
                username: "myusername",
                password: "P@55w0rd",
            });

            const response = await supertest(app)
                .post("/api/auth/login")
                .send({ username: "myusername", password: "P@55w0rd" });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("accessToken");
            expect(response.body).toHaveProperty("refreshToken");
            expect(typeof response.body.accessToken).toBe("string");
            expect(typeof response.body.refreshToken).toBe("string");
        });

        it("should respond 400 on invalid credentials", async () => {
            const response = await supertest(app)
                .post("/api/auth/login")
                .send({ username: "nonexistent", password: "wrong" });
            expect(response.status).toBe(400);
        });
    });

    describe("POST /refresh", () => {
        it("should respond 401 if refresh token not found", async () => {
            const response = await supertest(app)
                .post("/api/auth/refresh")
                .send({ refreshToken: "invalidtoken" });
            expect(response.status).toBe(401);
        });

        it("should respond 200 with new tokens if valid refresh token provided", async () => {
            await supertest(app)
                .post("/api/auth/register")
                .send({ nickname: "refresher", username: "refresher", password: "P@55w0rd" });

            const loginResponse = await supertest(app)
                .post("/api/auth/login")
                .send({ username: "refresher", password: "P@55w0rd" });

            const refreshToken = loginResponse.body.refreshToken;

            const response = await supertest(app).post("/api/auth/refresh").send({ refreshToken });

            expect(response.status).toBe(200);
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
            expect(typeof response.body.accessToken).toBe("string");
            expect(typeof response.body.refreshToken).toBe("string");
        });
    });

    describe("DELETE /logout", () => {
        it("should respond 204 on logout", async () => {
            await supertest(app)
                .post("/api/auth/register")
                .send({ nickname: "refresher", username: "refresher", password: "P@55w0rd" });

            const loginResponse = await supertest(app)
                .post("/api/auth/login")
                .send({ username: "refresher", password: "P@55w0rd" });

            const accessToken = loginResponse.body.accessToken;

            const response = await supertest(app)
                .delete("/api/auth/logout")
                .set("Authorization", `Bearer ${accessToken}`)
                .send();

            expect(response.status).toBe(204);
        });
    });
});
