import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/infrastructure/database/schema.sqlite.ts",
    out: "./src/infrastructure/database/migrations_sqlite",
    dialect: "sqlite",
    dbCredentials: {
        url: ":memory:",
    },
    strict: true,
});
