import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import OSS from "ali-oss";
import { env } from "../config/env";
import { toPublicPath } from "../utils/uploads";

const storageDriver = env.storage.driver || "local";

let ossClient: OSS | null = null;
let ossBaseUrl = "";

if (
  storageDriver === "oss" &&
  env.storage.oss.accessKeyId &&
  env.storage.oss.accessKeySecret &&
  env.storage.oss.bucket &&
  env.storage.oss.region
) {
  const endpoint = env.storage.oss.endpoint || undefined;
  ossClient = new OSS({
    accessKeyId: env.storage.oss.accessKeyId,
    accessKeySecret: env.storage.oss.accessKeySecret,
    bucket: env.storage.oss.bucket,
    region: env.storage.oss.region,
    endpoint,
    cname: false,
    timeout: env.storage.oss.timeoutMs
  });
  const baseHost =
    env.storage.oss.publicDomain ||
    `https://${env.storage.oss.bucket}.${env.storage.oss.region}.aliyuncs.com`;
  ossBaseUrl = baseHost;
}

export interface StoredFile {
  filePath: string;
  publicUrl: string;
  isRemote: boolean;
}

export function isRemotePath(filePath?: string | null) {
  if (!filePath) return false;
  return /^https?:\/\//i.test(filePath);
}

type PathLikeInput = string | { path?: unknown };

function normalizeLocalPath(input: PathLikeInput): string {
  if (typeof input === "string") return input;
  const rawPath = input && (input as { path?: unknown }).path;
  if (typeof rawPath === "string") return rawPath;
  if (Buffer.isBuffer(rawPath)) return rawPath.toString();
  throw new TypeError(
    "persistFile expects a file path string (or object with .path)"
  );
}

export async function persistFile(
  localPathInput: PathLikeInput,
  keyPrefix: string
): Promise<StoredFile> {
  const localPath = normalizeLocalPath(localPathInput);

  // 验证文件是否存在
  let fileBuffer: Buffer;
  try {
    fileBuffer = await fsp.readFile(localPath);
  } catch (err) {
    throw new Error(`File not found or cannot read: ${localPath}`);
  }

  if (storageDriver === "oss" && ossClient) {
    const sanitizedPrefix = keyPrefix.replace(/^\//, "").replace(/\\/g, "/");
    const uploadPrefix = (env.storage.oss.uploadPrefix || "uploads").replace(
      /^\//,
      ""
    );
    const key = path.posix
      .join(uploadPrefix, sanitizedPrefix, path.basename(localPath))
      .replace(/\\/g, "/");

    try {
      // 使用 Buffer 而不是文件路径，避免 multipartUpload 的路径参数检查
      console.log(
        `[OSS] Uploading ${localPath} (${fileBuffer.length} bytes) to ${key}`
      );
      await ossClient.put(key, fileBuffer, { timeout: env.storage.oss.timeoutMs });
      console.log(`[OSS] Upload success: ${key}`);

      await fsp.unlink(localPath).catch(() => {});

      const url = `${ossBaseUrl.replace(/\/$/, "")}/${key}`;
      return {
        filePath: url,
        publicUrl: url,
        isRemote: true,
      };
    } catch (err) {
      console.error(`[OSS] Upload failed for ${key}:`, err);
      throw err;
    }
  }

  return {
    filePath: localPath,
    publicUrl: toPublicPath(localPath),
    isRemote: false,
  };
}
