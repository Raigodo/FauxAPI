import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import "dotenv/config";

const s3Client = new S3Client({
    endpoint: process.env.BUCKET_ENDPOINT!,
    region: process.env.BUCKET_REGION!,
    credentials: {
        accessKeyId: process.env.BUCKET_ACCESS_KEY_ID!,
        secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: process.env.BUCKET_FORCE_PATH_STYLE! as unknown as boolean,
});

(s3Client as any).getSignedUrl = async (key: string) => {
    const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_RESOURCES,
        Key: key,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 30 });
    return url;
};

export default s3Client as S3Client & {
    getSignedUrl: (key: string) => Promise<string>;
};
