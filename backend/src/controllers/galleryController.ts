import { Request, Response, NextFunction } from "express";
import fs from "node:fs";
import path from "node:path";
import * as galleryModel from "../models/galleryModel";
import { toPublicPath } from "../utils/uploads";
import { compressToMaxSize, safeUnlink } from "../utils/image";
import { isRemotePath, persistFile } from "../services/storageService";
import { env } from "../config/env";

export async function listGallery(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const rows = await galleryModel.findAll({
      college: req.query.college as string,
      className: req.query.className as string,
      graduationYear: req.query.graduationYear as string,
    });
    const list = rows.map((row) => ({
      id: row.id,
      college: row.college,
      className: row.class_name,
      graduationYear: row.graduation_year,
      title: row.title,
      imageUrl: toPublicPath(row.file_path),
      previewUrl: buildPreviewUrl(row.file_path, row.preview_path),
      createdAt: row.created_at,
    }));
    res.json(list);
  } catch (error) {
    next(error);
  }
}

export async function createGallery(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "请上传合照文件" });
    }
    let sourcePath = file.path;

    // 将原图压缩到 20MB 以内（仅调整质量，不改变分辨率），以适配 OSS 处理限制
    try {
      sourcePath = await compressToMaxSize(file.path, 20 * 1024 * 1024);
    } catch (err) {
      console.warn("[gallery] 压缩原图失败，继续使用原始文件：", err);
    }

    const stored = await persistFile(sourcePath, "gallery");
    if (sourcePath !== file.path) {
      safeUnlink(file.path);
    }

    const id = await galleryModel.create({
      college: req.body.college,
      className: req.body.className || null,
      graduationYear: req.body.graduationYear,
      title: req.body.title,
      filePath: stored.filePath,
      previewPath: stored.filePath,
    });

    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
}

export async function updateGallery(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const photo = await galleryModel.findById(id);
    if (!photo) {
      return res.status(404).json({ message: "合照不存在" });
    }

    const file = req.file;
    let filePath: string | undefined = undefined;

    if (file) {
      let sourcePath = file.path;
      try {
        sourcePath = await compressToMaxSize(file.path, 20 * 1024 * 1024);
      } catch (err) {
        console.warn("[gallery] 压缩原图失败，继续使用原始文件：", err);
      }
      const stored = await persistFile(sourcePath, "gallery");
      filePath = stored.filePath;
      if (sourcePath !== file.path) {
        safeUnlink(file.path);
      }
      // 清理旧文件（仅限本地存储）
      if (!isRemotePath(photo.file_path)) {
        safeUnlink(photo.file_path);
        safeUnlink(photo.preview_path);
      }
    }

    await galleryModel.update(id, {
      college: req.body.college,
      className: req.body.className || null,
      graduationYear: req.body.graduationYear,
      title: req.body.title,
      filePath,
      previewPath: filePath
    });

    res.json({ message: "合照已更新" });
  } catch (error) {
    next(error);
  }
}

export async function deleteGallery(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    const photo = await galleryModel.findById(id);
    if (!photo) {
      return res.status(404).json({ message: "合照不存在" });
    }
    await galleryModel.remove(id);
    await Promise.all([
      safeUnlink(photo.file_path),
      safeUnlink(photo.preview_path),
    ]);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function downloadGallery(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    const photo = await galleryModel.findById(id);
    if (!photo) {
      return res.status(404).json({ message: "合照不存在" });
    }
    const filePath = photo.file_path;
    if (!filePath) {
      return res.status(404).json({ message: "文件已丢失" });
    }
    if (isRemotePath(filePath)) {
      return res.redirect(filePath);
    }
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "文件已丢失" });
    }
    const filename = photo.title
      ? `${photo.title}${path.extname(filePath) || ".jpg"}`
      : path.basename(filePath);
    res.download(filePath, filename);
  } catch (error) {
    next(error);
  }
}

function buildPreviewUrl(
  originalPath?: string | null,
  previewPath?: string | null
) {
  const raw = previewPath || originalPath;
  const url = toPublicPath(raw);
  if (!url) return "";
  const isRemote = /^https?:\/\//i.test(url);
  if (isRemote && env.storage.driver === "oss") {
    try {
      const u = new URL(url);
      if (!u.searchParams.has("x-oss-process")) {
        u.searchParams.append(
          "x-oss-process",
          "image/resize,m_lfit,w_1024/quality,q_60"
        );
      }
      return u.toString();
    } catch {
      const connector = url.includes("?") ? "&" : "?";
      return `${url}${connector}x-oss-process=image/resize,m_lfit,w_1600/quality,q_75`;
    }
  }
  return url;
}
