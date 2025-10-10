import { S3Client } from "@aws-sdk/client-s3";
import "dotenv/config";

const s3 = new S3Client({
    endpoint: process.env.BUCKET_ENDPOINT!,
    region: process.env.BUCKET_REGION!,
    credentials: {
        accessKeyId: process.env.BUCKET_ACCESS_KEY_ID!,
        secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: process.env.BUCKET_FORCE_PATH_STYLE! as unknown as boolean,
});

export default s3;
