import { defineStore } from 'pinia'
import type {
  FrameStyle,
  GalleryItem,
  MetaInfo,
  PhotoTransform,
  TemplateConfig
} from '@/types/postcard'
import {
  fetchGallery,
  fetchTemplates,
  recordDownload,
  recordGenerate
} from '@/services/api'
import { composePostcard } from '@/utils/canvas'

const defaultTransform: PhotoTransform = {
  scale: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0
}

const defaultMeta: MetaInfo = {
  displayName: '',
  college: '',
  graduationYear: '',
  showName: true,
  showCollege: true,
  showYear: true,
  showSlogan: true
}

export const usePostcardStore = defineStore('postcard', {
  state: () => ({
    templates: [] as TemplateConfig[],
    selectedTemplateId: '' as string,
    userImage: '' as string,
    transform: { ...defaultTransform } as PhotoTransform,
    meta: { ...defaultMeta } as MetaInfo,
    previewDataUrl: '' as string,
    loading: false,
    gallery: [] as GalleryItem[],
    galleryFilters: {
      college: '',
      className: '',
      graduationYear: ''
    },
    error: '',
    frameStyle: 'none' as FrameStyle
  }),
  getters: {
    selectedTemplate(state): TemplateConfig | undefined {
      return state.templates.find((tpl) => String(tpl.id) === state.selectedTemplateId)
    },
    canGenerate(state): boolean {
      return Boolean(state.selectedTemplateId && state.userImage)
    }
  },
  actions: {
    async bootstrap() {
      if (this.templates.length) return
      try {
        this.templates = await fetchTemplates()
        this.selectedTemplateId = this.templates[0] ? String(this.templates[0].id) : ''
      } catch (error) {
        console.error(error)
        this.error = '模板加载失败，请稍后重试。'
      }
    },
    selectTemplate(id: string | number) {
      this.selectedTemplateId = String(id)
      this.transform = { ...defaultTransform }
    },
    async setUserImage(file: File) {
      this.userImage = await this.readFileAsBase64(file)
      this.transform = { ...defaultTransform }
      this.previewDataUrl = ''
      this.nudgeTransform()
      if (this.selectedTemplate) {
        await this.generatePreview()
      }
    },
    updateTransform(partial: Partial<PhotoTransform>) {
      this.transform = { ...this.transform, ...partial }
    },
    updateMeta(partial: Partial<MetaInfo>) {
      this.meta = { ...this.meta, ...partial }
    },
    resetEditor() {
      this.transform = { ...defaultTransform }
      this.userImage = ''
      this.previewDataUrl = ''
    },
    setFrameStyle(style: FrameStyle) {
      this.frameStyle = style
    },
    nudgeTransform() {
      // 轻微调整以触发画布/预览刷新
      this.transform = { ...this.transform, scale: this.transform.scale + 0.0001 }
    },
    async generatePreview() {
      if (!this.selectedTemplate || !this.userImage) return
      this.loading = true
      this.error = ''
      try {
        this.previewDataUrl = await composePostcard({
          template: this.selectedTemplate,
          userImage: this.userImage,
          transform: this.transform,
          meta: this.meta,
          frameStyle: this.frameStyle,
          exportScale: 2
        })
        await recordGenerate({
          templateId: this.selectedTemplate.id,
          displayName: this.meta.displayName,
          college: this.meta.college,
          graduationYear: this.meta.graduationYear,
        })
      } catch (error) {
        console.error(error)
        this.error = '合成明信片失败，请检查上传的照片或稍后再试。'
      } finally {
        this.loading = false
      }
    },
    async loadGallery() {
      this.gallery = await fetchGallery({
        college: this.galleryFilters.college,
        className: this.galleryFilters.className,
        graduationYear: this.galleryFilters.graduationYear
      })
    },
    async markDownload() {
      if (!this.selectedTemplate) return
      await recordDownload({
        templateId: this.selectedTemplate.id,
        displayName: this.meta.displayName,
        college: this.meta.college,
        graduationYear: this.meta.graduationYear
      })
    },
    async readFileAsBase64(file: File) {
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    }
  }
})
