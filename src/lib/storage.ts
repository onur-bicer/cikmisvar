import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const maxSizeInBytes = 15 * 1024 * 1024;

export async function savePdf(file: File) {
  if (file.type !== "application/pdf") {
    throw new Error("Sadece PDF dosyasi kabul edilir.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  if (bytes.byteLength > maxSizeInBytes) {
    throw new Error("PDF boyutu 15MB ustunde olamaz.");
  }

  const fileName = `${Date.now()}-${randomUUID()}.pdf`;
  const provider = process.env.STORAGE_PROVIDER || "local";

  if (provider === "s3") {
    const bucket = process.env.S3_BUCKET;
    const region = process.env.S3_REGION;
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

    if (!bucket || !region || !accessKeyId || !secretAccessKey) {
      throw new Error("S3 ayarlari eksik.");
    }

    const client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true"
    });

    const key = `uploads/${fileName}`;

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: bytes,
        ContentType: "application/pdf"
      })
    );

    const publicBase = process.env.S3_PUBLIC_BASE_URL;
    const fileUrl = publicBase
      ? `${publicBase.replace(/\/$/, "")}/${key}`
      : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return { fileUrl, fileSize: bytes.byteLength };
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(path.join(uploadDir, fileName), bytes);

  return {
    fileUrl: `/uploads/${fileName}`,
    fileSize: bytes.byteLength
  };
}
