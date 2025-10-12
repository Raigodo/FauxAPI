import s3 from "#infrastructure/bucket/client.js";
import db from "#infrastructure/database/client.pg.js";

const services = new Map<string, unknown>();

services.set("database", db);
services.set("bucket", s3);

const serviceProvider = {
    get: (name: string) => {
        return services.get(name);
    },
    set: (name: string, value: unknown) => {
        services.set(name, value);
    },

    getDatabase: () => {
        return services.get("database") as typeof db;
    },
    getBucket: () => {
        return services.get("bucket") as typeof s3;
    },
};

export { serviceProvider };
