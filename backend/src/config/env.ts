import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const rootDir = path.resolve(__dirname, "../../");
const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(rootDir, "uploads");

function parseList(value?: string, fallback?: string[]): string[] {
  if (value) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return fallback ?? [];
}

const defaultClient = "http://localhost:5173";
const defaultAdmin = "http://localhost:5174";

const clientUrls = parseList(
  process.env.CLIENT_URLS || process.env.CLIENT_URL,
  [defaultClient]
);
const adminUrls = parseList(process.env.ADMIN_URLS || process.env.ADMIN_URL, [
  defaultAdmin,
]);

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  host: process.env.HOST || "0.0.0.0",
  publicUrl: process.env.PUBLIC_URL || "http://localhost:4000",
  clientUrl: clientUrls[0] || defaultClient,
  clientUrls,
  adminUrl: adminUrls[0] || defaultAdmin,
  adminUrls,
  jwtSecret: process.env.JWT_SECRET || "alumni-secret",
  adminAccount: process.env.ADMIN_ACCOUNT || "admin@123.com",
  adminPassword: process.env.ADMIN_PASSWORD || "",
  adminPasswordHash:
    process.env.ADMIN_PASSWORD_HASH ||
    "$2b$10$FUXvIn.7LY1CI9Zm.lOs.eTY/3mMeZzfTL1ZAD0rpspgpGnwBQQOe", // hash for "ChangeMe123"
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "alumni_postcards",
  },
  uploadDir,
  logLevel: process.env.LOG_LEVEL || "dev",
  uploadMaxSizeBytes: Number(process.env.UPLOAD_MAX_SIZE_MB || 50) * 1024 * 1024,
  storage: {
    driver: process.env.STORAGE_DRIVER || "local",
    oss: {
      accessKeyId: process.env.OSS_ACCESS_KEY_ID || "",
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || "",
      bucket: process.env.OSS_BUCKET || "",
      region: process.env.OSS_REGION || "",
      endpoint: process.env.OSS_ENDPOINT || "",
      publicDomain: process.env.OSS_PUBLIC_DOMAIN || "",
      uploadPrefix: process.env.OSS_UPLOAD_PREFIX || "uploads",
      timeoutMs: Number(process.env.OSS_TIMEOUT_MS || 120000)
    },
  },
};
