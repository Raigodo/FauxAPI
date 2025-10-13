import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    type S3Client,
} from "@aws-sdk/client-s3";

const store = new Map<string, Buffer>();

const fakeS3: Partial<S3Client> = {
    send: async (command: unknown) => {
        if (command instanceof PutObjectCommand) {
            const key = command.input.Key!;
            const inputBody = command.input.Body;

            let body: Buffer;

            if (typeof inputBody === "string") {
                body = Buffer.from(inputBody);
            } else if (Buffer.isBuffer(inputBody)) {
                body = inputBody;
            } else if (inputBody instanceof Uint8Array) {
                body = Buffer.from(inputBody);
            } else if (typeof (inputBody as Blob)?.arrayBuffer === "function") {
                body = Buffer.from(await (inputBody as Blob).arrayBuffer());
            } else {
                throw new Error("Unsupported Body type in PutObjectCommand");
            }

            store.set(key, body);

            return { ETag: `"fake-etag-${Date.now()}"` };
        }

        if (command instanceof GetObjectCommand) {
            const key = command.input.Key!;
            const obj = store.get(key);
            return { Body: obj };
        }

        if (command instanceof DeleteObjectCommand) {
            const key = command.input.Key!;
            store.delete(key);
            return {};
        }

        console.log("Fake S3 unknown command:", command);
        return {};
    },
} as S3Client;

(fakeS3 as any).getSignedUrl = (key: string) => {
    return "fake-url";
};

export default fakeS3 as S3Client & {
    getSignedUrl: (key: string) => Promise<string>;
};
