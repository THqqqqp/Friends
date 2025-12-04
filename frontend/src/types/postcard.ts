export type FrameStyle = 'none' | 'solid' | 'dashed' | 'stamp'

export interface TemplatePhotoArea {
  /** relative X offset in percentage (0-1) */
  x: number
  /** relative Y offset in percentage (0-1) */
  y: number
  /** relative width in percentage (0-1) */
  width: number
  /** relative height in percentage (0-1) */
  height: number
  /** width / height ratio */
  ratio?: number
}

export interface CanvasSize {
  width: number
  height: number
}

export interface TemplateConfig {
  id: string | number
  name: string
  description: string
  slogan: string
  logoUrl?: string
  backgroundUrl: string
  thumbnailUrl?: string
  aspectRatio: '3:4' | '1:1' | '16:9'
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  photoArea: TemplatePhotoArea
  canvasSize: CanvasSize
}

export interface MetaInfo {
  displayName: string
  college: string
  graduationYear: string
  showName: boolean
  showCollege: boolean
  showYear: boolean
  showSlogan: boolean
}

export interface PhotoTransform {
  scale: number
  rotation: number
  offsetX: number
  offsetY: number
}

export interface GalleryItem {
  id: string
  college: string
  className?: string | null
  graduationYear: string
  imageUrl: string
  previewUrl?: string
  downloadUrl?: string
  createdAt: string
}

export interface GeneratePayload {
  template: TemplateConfig
  userImage: string
  transform: PhotoTransform
  meta: MetaInfo
  frameStyle?: FrameStyle
  exportScale?: number
}

export interface GenerationStatPayload {
  templateId: string | number
  displayName?: string
  college?: string
  graduationYear?: string
  event?: 'generate' | 'download'
}
