export interface PhotoArea {
  x: number
  y: number
  width: number
  height: number
  ratio?: number
}

export interface TemplateItem {
  id: number
  name: string
  description?: string
  slogan?: string | null
  logoUrl?: string | null
  backgroundUrl?: string | null
  aspectRatio: string
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  photoArea: PhotoArea
  canvasSize: {
    width: number
    height: number
  }
}

export interface GalleryPhoto {
  id: number
  college: string
  className?: string | null
  graduationYear: string
  title?: string | null
  imageUrl: string
  previewUrl?: string
  createdAt: string
}

export interface GalleryUpdatePayload {
  college?: string
  className?: string | null
  graduationYear?: string
  title?: string
  file?: File | null
}

export interface ChartPoint {
  day: string
  generate: number
  download: number
}

export interface StatsChartResponse {
  dailyTrends: ChartPoint[]
  totals: {
    generate: number
    download: number
  }
  downloadByCollege: {
    college: string
    total: number
  }[]
}
