import app from "#app.js";
import * as schemas from "#infrastructure/database/schema.pg.js";
import { serviceProvider } from "#services/service-provider.js";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import supertest from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

beforeAll(async () => {
    const db = drizzle(":memory:", { schema: schemas });
    migrate(db, { migrationsFolder: "./src/infrastructure/database/migrations_sqlite" });
    serviceProvider.set("database", db);
});

describe("Users", () => {
    describe("Register", () => {
        it("Should respond with status code 204", async () => {
            const response = await supertest(app)
                .post("/api/auth/register")
                .send({ nickname: "user one", username: "myusername", password: "P@55w0rd" });

            expect(response.status).toBe(204);
        });
    });
});
