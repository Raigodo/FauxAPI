import type { S3Client } from "@aws-sdk/client-s3";

export const fakeS3: Partial<S3Client> = {
    send: async (command: any) => {
        console.log("🧪 Fake S3 send called with:", command.constructor.name);
        return Promise.resolve({});
    },
} as S3Client;
