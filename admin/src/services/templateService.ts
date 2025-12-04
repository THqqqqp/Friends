import { apiClient } from './http'
import type { PhotoArea, TemplateItem } from '@/types/api'
import { resolveUploadUrl } from '@/utils/url'

export interface TemplateFormState {
  name: string
  description?: string
  slogan?: string
  aspectRatio?: string
  canvasWidth?: number
  canvasHeight?: number
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  photoArea?: PhotoArea
}

export interface TemplateSavePayload extends TemplateFormState {
  backgroundFile?: File | null
  logoFile?: File | null
  removeBackground?: boolean
  removeLogo?: boolean
}

function buildFormData(payload: TemplateSavePayload) {
  const formData = new FormData()
  if (payload.name) formData.append('name', payload.name)
  if (payload.description) formData.append('description', payload.description)
  if (payload.slogan) formData.append('slogan', payload.slogan)
  if (payload.aspectRatio) formData.append('aspectRatio', payload.aspectRatio)
  if (payload.canvasWidth) formData.append('canvasWidth', String(payload.canvasWidth))
  if (payload.canvasHeight) formData.append('canvasHeight', String(payload.canvasHeight))
  if (payload.logoPosition) formData.append('logoPosition', payload.logoPosition)
  if (payload.photoArea) {
    formData.append('photoArea', JSON.stringify(payload.photoArea))
  }
  if (payload.removeBackground) {
    formData.append('removeBackground', 'true')
  }
  if (payload.removeLogo) {
    formData.append('removeLogo', 'true')
  }
  if (payload.backgroundFile) {
    formData.append('background', payload.backgroundFile)
  }
  if (payload.logoFile) {
    formData.append('logo', payload.logoFile)
  }
  return formData
}

function normalize<T extends TemplateItem>(template: T): T {
  return {
    ...template,
    backgroundUrl: resolveUploadUrl(template.backgroundUrl),
    logoUrl: resolveUploadUrl(template.logoUrl),
    logoPosition: template.logoPosition || 'top-left'
  }
}

export async function fetchTemplates() {
  const { data } = await apiClient.get<TemplateItem[]>('/templates')
  return data.map(normalize)
}

export async function fetchTemplateById(id: number) {
  const { data } = await apiClient.get<TemplateItem>(`/templates/${id}`)
  return normalize(data)
}

export async function createTemplate(payload: TemplateSavePayload) {
  const formData = buildFormData(payload)
  const { data } = await apiClient.post<{ id: number }>('/templates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export async function updateTemplate(id: number, payload: TemplateSavePayload) {
  const formData = buildFormData(payload)
  const { data } = await apiClient.put(`/templates/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export async function deleteTemplate(id: number) {
  await apiClient.delete(`/templates/${id}`)
}
