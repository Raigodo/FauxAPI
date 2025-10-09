import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { namespaceTable, resourceTable, userTable } from "./schema.js";
import * as schemas from "./schema.js";

const db = drizzle(process.env.DATABASE_URL!, {
  logger: true,
  schema: schemas,
});

const user = {
  id: "aaa",
  nickname: "User Uno",
  username: "username",
  password: "password",
};
await db.insert(userTable).values(user);
console.log("New user created!");

// Create a namespace for this user
const namespace = {
  id: "ns1",
  user_id: user.id,
};
await db.insert(namespaceTable).values(namespace);
console.log("Namespace created!");

// Create a resource under the namespace
const resource = {
  id: "res1",
  namespace_id: namespace.id,
  user_id: user.id,
  content_type: "text/plain",
};
await db.insert(resourceTable).values(resource);
console.log("Resource created!");

// Fetch namespaces with related resources
const allNamespaces = await db.select().from(namespaceTable).leftJoin(resourceTable, eq(resourceTable.namespace_id, namespaceTable.id));
console.log("Namespaces with resources:", allNamespaces);

// Fetch resources with user and namespace info
const allResources = await db
  .select()
  .from(resourceTable)
  .leftJoin(userTable, eq(resourceTable.user_id, userTable.id))
  .leftJoin(namespaceTable, eq(resourceTable.namespace_id, namespaceTable.id));
console.log("Resources with user and namespace:", allResources);

// Cleanup
await db.delete(userTable).where(eq(userTable.id, user.id));
console.log("All test data deleted!");

export default db;
