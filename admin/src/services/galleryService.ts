import { apiBaseUrl, apiClient } from './http'
import type { GalleryPhoto } from '@/types/api'
import { resolveUploadUrl } from '@/utils/url'

export interface GalleryFilters {
  college?: string
  className?: string
  graduationYear?: string
}

export interface GalleryUploadPayload {
  college: string
  className?: string
  graduationYear: string
  title?: string
  file: File
}

export interface UploadOptions {
  onUploadProgress?: (percent: number) => void
  timeoutMs?: number
}

export interface GalleryUpdatePayload {
  college?: string
  className?: string
  graduationYear?: string
  title?: string
  file?: File | null
}

export async function fetchGallery(filters: GalleryFilters = {}) {
  const { data } = await apiClient.get<GalleryPhoto[]>('/gallery', {
    params: filters
  })
  return data.map((item) => ({
    ...item,
    imageUrl: resolveUploadUrl(item.imageUrl),
    previewUrl: resolveUploadUrl(item.previewUrl || item.imageUrl)
  }))
}

export async function uploadGalleryPhoto(payload: GalleryUploadPayload, options: UploadOptions = {}) {
  const formData = new FormData()
  formData.append('college', payload.college)
  if (payload.className) formData.append('className', payload.className)
  formData.append('graduationYear', payload.graduationYear)
  if (payload.title) formData.append('title', payload.title)
  formData.append('photo', payload.file)
  const { data } = await apiClient.post('/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: options.timeoutMs ?? 120000,
    onUploadProgress: (event) => {
      if (!options.onUploadProgress || !event.total) return
      const percent = Math.min(100, Math.round((event.loaded / event.total) * 100))
      options.onUploadProgress(percent)
    }
  })
  return data
}

export async function deleteGalleryPhoto(id: number) {
  await apiClient.delete(`/gallery/${id}`)
}

export function buildDownloadUrl(id: number) {
  return `${apiBaseUrl}/gallery/download/${id}`
}

export async function updateGalleryPhoto(
  id: number,
  payload: GalleryUpdatePayload,
  options: UploadOptions = {}
) {
  const formData = new FormData()
  if (payload.college !== undefined) formData.append('college', payload.college)
  if (payload.className !== undefined) formData.append('className', payload.className)
  if (payload.graduationYear !== undefined) formData.append('graduationYear', payload.graduationYear)
  if (payload.title !== undefined) formData.append('title', payload.title)
  if (payload.file) formData.append('photo', payload.file)

  const { data } = await apiClient.patch(`/gallery/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: options.timeoutMs ?? 120000,
    onUploadProgress: (event) => {
      if (!options.onUploadProgress || !event.total) return
      const percent = Math.min(100, Math.round((event.loaded / event.total) * 100))
      options.onUploadProgress(percent)
    }
  })
  return data
}
