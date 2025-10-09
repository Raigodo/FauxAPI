import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";

// === CONFIG ===
const s3 = new S3Client({
  endpoint: "http://localhost:9000",
  region: "us-east-1",
  credentials: {
    accessKeyId: "minioadmin",
    secretAccessKey: "minioadmin",
  },
  forcePathStyle: true,
});

const BUCKET = "faux-api-bucket";
const FILE_KEY = "hello.txt";

try {
  console.log("Uploading file...");
  const content = "Hello MinIO!";
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: FILE_KEY,
      Body: content,
      ContentType: "text/plain",
    }),
  );
  console.log("Upload done");

  console.log("Listing files...");
  const list = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET }));
  console.log(
    "Files in bucket:",
    list.Contents?.map((f) => f.Key),
  );

  console.log("Downloading file...");
  const getObj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: FILE_KEY }));
  const data = await getObj.Body!.transformToString();
  console.log("Downloaded content:", data);

  console.log("Updating file...");
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: FILE_KEY,
      Body: "Updated content!",
      ContentType: "text/plain",
    }),
  );
  console.log("File updated");

  console.log("Deleting file...");
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: FILE_KEY }));
  console.log("File deleted");
} catch (err) {
  console.error("❌ Error:", err);
}

export default s3;
