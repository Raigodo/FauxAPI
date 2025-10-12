import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: "./src/infrastructure/database/migrations",
    schema: "./src/infrastructure/database/schema.pg.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    strict: true,
});
