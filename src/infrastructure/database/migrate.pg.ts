import { migrate } from "drizzle-orm/node-postgres/migrator";
import db from "./client.pg.js";

//File used to seed database and is run directly by migrate container
await migrate(db.db, { migrationsFolder: "src/infrastructure/database/migrations" });
