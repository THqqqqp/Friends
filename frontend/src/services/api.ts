import axios from "axios";
import type {
  GalleryItem,
  GenerationStatPayload,
  TemplateConfig,
} from "@/types/postcard";
import { resolveUploadUrl } from "@/utils/url";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const API_BASE_PATH = API_BASE_URL.replace(/\/$/, "") || "/api";
const UPLOAD_BASE_URL =
  import.meta.env.VITE_UPLOAD_BASE_URL ||
  API_BASE_URL.replace(/\/api(?:\/)?$/, "/uploads");

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export interface GalleryFilters {
  college?: string;
  className?: string;
  graduationYear?: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
}

export interface TemplatePayload {
  name: string;
  description: string;
  slogan: string;
}

const fallbackTemplates: TemplateConfig[] = [
  {
    id: "classic-blue",
    name: "经典蓝色",
    description: "校园主视觉＋经典宣言",
    slogan: "再聚于此，共赴山海",
    logoUrl: "https://dummyimage.com/200x80/1d4ed8/ffffff&text=FRIENDS",
    backgroundUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=600",
    aspectRatio: "3:4",
    photoArea: { x: 0.15, y: 0.2, width: 0.7, height: 0.45 },
    canvasSize: { width: 1080, height: 1440 },
  },
  {
    id: "lake-aurora",
    name: "湖畔暮光",
    description: "夜幕灯光＋LOGO渐层",
    slogan: "光影之间，依旧少年",
    logoUrl: "https://dummyimage.com/200x80/0f172a/ffffff&text=FRIENDS",
    backgroundUrl:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600",
    aspectRatio: "3:4",
    photoArea: { x: 0.1, y: 0.25, width: 0.8, height: 0.5 },
    canvasSize: { width: 1080, height: 1440 },
  },
  {
    id: "arena-red",
    name: "竞技红",
    description: "红蓝撞色赛事主题",
    slogan: "热血不灭，友谊长存",
    logoUrl: "https://dummyimage.com/200x80/b91c1c/ffffff&text=FRIENDS",
    backgroundUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600",
    aspectRatio: "3:4",
    photoArea: { x: 0.2, y: 0.1, width: 0.6, height: 0.55 },
    canvasSize: { width: 1080, height: 1440 },
  },
];

const fallbackGallery: GalleryItem[] = [
  {
    id: "demo-1",
    college: "计算机学院",
    graduationYear: "2015",
    imageUrl:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800",
    downloadUrl:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800",
    createdAt: new Date().toISOString(),
  },
];

function normalizeTemplate(template: TemplateConfig): TemplateConfig {
  const backgroundUrl = resolveUploadUrl(template.backgroundUrl, UPLOAD_BASE_URL);
  const logoUrl = resolveUploadUrl(template.logoUrl, UPLOAD_BASE_URL);
  const thumbnailUrl = template.thumbnailUrl
    ? resolveUploadUrl(template.thumbnailUrl, UPLOAD_BASE_URL)
    : backgroundUrl;
  return {
    ...template,
    backgroundUrl,
    logoUrl,
    thumbnailUrl,
  };
}

export async function fetchTemplates(): Promise<TemplateConfig[]> {
  try {
    const { data } = await http.get<TemplateConfig[]>("/templates");
    return data.map(normalizeTemplate);
  } catch (error) {
    console.warn("模板接口不可用，使用内置示例数据。", error);
    return fallbackTemplates;
  }
}

export async function fetchGallery(
  filters: GalleryFilters
): Promise<GalleryItem[]> {
  try {
    const { data } = await http.get<GalleryItem[]>("/gallery", {
      params: filters,
    });
    return data.map((item) => {
      const normalizedImageUrl = resolveUploadUrl(item.imageUrl, UPLOAD_BASE_URL);
      const normalizedPreviewUrl = resolveUploadUrl(item.previewUrl || item.imageUrl, UPLOAD_BASE_URL);
      const downloadUrl = `${API_BASE_PATH}/gallery/download/${item.id}`;
      return {
        ...item,
        imageUrl: normalizedImageUrl,
        previewUrl: normalizedPreviewUrl,
        downloadUrl,
      };
    });
  } catch (error) {
    console.warn("合照接口不可用，使用示例数据。", error);
    return fallbackGallery.filter((item) => {
      const collegeMatches = filters.college
        ? item.college.includes(filters.college)
        : true;
      const classMatches = filters.className
        ? (item as GalleryItem).className?.includes(filters.className)
        : true;
      const yearMatches = filters.graduationYear
        ? item.graduationYear === filters.graduationYear
        : true;
      return collegeMatches && classMatches && yearMatches;
    });
  }
}

export async function uploadTemplate(payload: TemplatePayload, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value);
  });
  const { data } = await http.post("/templates", formData);
  return data;
}

export async function recordGenerate(payload: GenerationStatPayload) {
  try {
    await http.post("/stats/generate", payload);
  } catch (error) {
    console.warn("生成统计上报失败（忽略，不影响用户体验）", error);
  }
}

export async function recordDownload(payload: GenerationStatPayload) {
  try {
    await http.post("/stats/download", payload);
  } catch (error) {
    console.warn("下载统计上报失败（忽略，不影响用户体验）", error);
  }
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>("/auth/login", {
    username,
    password,
  });
  if (data?.token) {
    http.defaults.headers.common.Authorization = `Bearer ${data.token}`;
  }
  return data;
}
