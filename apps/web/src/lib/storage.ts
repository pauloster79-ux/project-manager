// src/lib/storage.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.S3_REGION || "us-east-1";
const endpoint = process.env.S3_ENDPOINT || undefined;
const forcePathStyle = (process.env.S3_FORCE_PATH_STYLE || "false") === "true";

export const s3 = new S3Client({
  region,
  endpoint,
  forcePathStyle,
  credentials: process.env.S3_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      }
    : undefined,
});

export async function presignPut(key: string, contentType: string, expiresSeconds = 900) {
  const cmd = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn: expiresSeconds });
  return url;
}

export async function getObjectText(key: string): Promise<Uint8Array> {
  const res = await s3.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }));
  // @ts-ignore
  const body = await res.Body?.transformToByteArray?.();
  if (!body) throw new Error("Empty object body");
  return body as Uint8Array;
}
