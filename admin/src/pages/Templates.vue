<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import type { AxiosError } from 'axios'
import UploadImage from '@/components/UploadImage.vue'
import CanvasSelector from '@/components/CanvasSelector.vue'
import ToastMessage from '@/components/ToastMessage.vue'
import type { PhotoArea, TemplateItem } from '@/types/api'
import {
  createTemplate,
  deleteTemplate,
  fetchTemplateById,
  fetchTemplates,
  updateTemplate
} from '@/services/templateService'

type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const templates = ref<TemplateItem[]>([])
const selectedId = ref<number | null>(null)
const loading = ref(false)
const saving = ref(false)
type ToastType = 'success' | 'error' | 'info'
const toast = reactive({
  visible: false,
  message: '',
  type: 'info' as ToastType
})

const fileState = reactive<{
  background: File | null
  logo: File | null
  preview: Record<'background' | 'logo', string>
  objectUrl: Record<'background' | 'logo', boolean>
}>({
  background: null,
  logo: null,
  preview: {
    background: '',
    logo: ''
  },
  objectUrl: {
    background: false,
    logo: false
  }
})
const removeBackgroundAsset = ref(false)
const removeLogoAsset = ref(false)

const defaultArea: PhotoArea = {
  x: 0.15,
  y: 0.1,
  width: 0.7,
  height: 0.55,
  ratio: Number((0.7 / 0.55).toFixed(3))
}

const form = reactive({
  name: '',
  description: '',
  slogan: '',
  aspectRatio: '3:4',
  canvasWidth: 1080,
  canvasHeight: 1440,
  backgroundUrl: '',
  logoUrl: '',
  logoPosition: 'top-left' as LogoPosition,
  photoArea: { ...defaultArea } as PhotoArea
})

const isCreating = computed(() => selectedId.value === null)
const ratioOptions = [
  { label: '1:1', value: 1 },
  { label: '3:4', value: 3 / 4 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 }
]
const selectedRatioPixels = ref(1)

const logoPositionOptions: { label: string; value: LogoPosition }[] = [
  { label: '左上', value: 'top-left' },
  { label: '右上', value: 'top-right' },
  { label: '左下', value: 'bottom-left' },
  { label: '右下', value: 'bottom-right' }
]

const logoPositionClasses: Record<LogoPosition, string> = {
  'top-left': 'left-6 top-6',
  'top-right': 'right-6 top-6',
  'bottom-left': 'left-6 bottom-6',
  'bottom-right': 'right-6 bottom-6'
}

const backgroundMeta = reactive({
  width: 1080,
  height: 1440
})

const backgroundAspectRatio = computed(() => {
  if (backgroundMeta.width && backgroundMeta.height) {
    return Number((backgroundMeta.width / backgroundMeta.height).toFixed(4))
  }
  return 0.75
})

const backgroundSizeLabel = computed(() => {
  if (!backgroundMeta.width || !backgroundMeta.height) return '未获取'
  return `${backgroundMeta.width} × ${backgroundMeta.height}`
})

const normalizedLockedRatio = computed(() => {
  const aspect = backgroundAspectRatio.value || 1
  return selectedRatioPixels.value / aspect || 1
})

function showToast(message: string, type: ToastType = 'info') {
  toast.message = message
  toast.type = type
  toast.visible = true
}

onMounted(async () => {
  await loadTemplates()
})

onBeforeUnmount(() => {
  ;(['background', 'logo'] as const).forEach((key) => {
    if (fileState.objectUrl[key] && fileState.preview[key]) {
      URL.revokeObjectURL(fileState.preview[key])
    }
  })
})

const currentBackgroundSource = computed(
  () => fileState.preview.background || form.backgroundUrl
)

watch(
  currentBackgroundSource,
  (src) => {
    if (!src) {
      backgroundMeta.width = form.canvasWidth || 1080
      backgroundMeta.height = form.canvasHeight || 1440
      form.photoArea = applyRatioToArea(form.photoArea, selectedRatioPixels.value)
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      backgroundMeta.width = img.naturalWidth || 1080
      backgroundMeta.height = img.naturalHeight || 1440
      form.canvasWidth = backgroundMeta.width
      form.canvasHeight = backgroundMeta.height
      form.aspectRatio = `${backgroundMeta.width}:${backgroundMeta.height}`
      form.photoArea = applyRatioToArea(form.photoArea, selectedRatioPixels.value)
    }
    img.onerror = () => {
      backgroundMeta.width = 1080
      backgroundMeta.height = 1440
      form.photoArea = applyRatioToArea(form.photoArea, selectedRatioPixels.value)
    }
    img.src = src
  },
  { immediate: true }
)

watch(
  () => form.photoArea.ratio,
  (ratio) => {
    if (ratio && ratio > 0) {
      const aspect = backgroundAspectRatio.value || 1
      selectedRatioPixels.value = Number((ratio * aspect).toFixed(4))
    }
  },
  { immediate: true }
)

function ensureCanvasSizeSync() {
  if (backgroundMeta.width && backgroundMeta.height) {
    form.canvasWidth = backgroundMeta.width
    form.canvasHeight = backgroundMeta.height
    form.aspectRatio = `${backgroundMeta.width}:${backgroundMeta.height}`
  }
}

function clampPercent(value: number) {
  return Math.min(1, Math.max(0, value))
}

function applyRatioToArea(area: PhotoArea, desiredPixelRatio: number): PhotoArea {
  const aspect = backgroundAspectRatio.value || 1
  const safeRatio = Math.max(desiredPixelRatio / aspect, 0.1)
  let x = clampPercent(area.x)
  let y = clampPercent(area.y)
  let width = area.width > 0 ? Math.min(area.width, 1 - x) : 0.3
  let height = width / safeRatio

  if (y + height > 1) {
    height = 1 - y
    width = height * safeRatio
  }
  if (x + width > 1) {
    width = 1 - x
    height = width / safeRatio
  }

  width = Math.max(width, 0.05)
  height = Math.max(height, 0.05)

  return {
    ...area,
    x: Number(x.toFixed(4)),
    y: Number(y.toFixed(4)),
    width: Number(width.toFixed(4)),
    height: Number(height.toFixed(4)),
    ratio: Number(safeRatio.toFixed(4))
  }
}

function setRatio(value: number) {
  selectedRatioPixels.value = value
  form.photoArea = applyRatioToArea(form.photoArea, value)
}

function handleAreaChange(area: PhotoArea) {
  form.photoArea = {
    ...area,
    ratio: area.ratio || normalizedLockedRatio.value
  }
  if (area.ratio) {
    selectedRatioPixels.value = Number(
      (area.ratio * (backgroundAspectRatio.value || 1)).toFixed(4)
    )
  }
}

function handleLogoPositionChange(position: LogoPosition) {
  form.logoPosition = position
}

const previewLogoClass = computed(
  () => logoPositionClasses[form.logoPosition] ?? logoPositionClasses['top-left']
)

const photoAreaPreviewStyle = computed(() => ({
  top: `${form.photoArea.y * 100}%`,
  left: `${form.photoArea.x * 100}%`,
  width: `${form.photoArea.width * 100}%`,
  height: `${form.photoArea.height * 100}%`
}))

async function loadTemplates() {
  loading.value = true
  try {
    templates.value = await fetchTemplates()
    const firstTemplate = templates.value[0]
    if (!firstTemplate) {
      resetForm()
      selectedId.value = null
      return
    }
    const targetId = selectedId.value ?? firstTemplate.id
    await selectTemplate(targetId)
  } catch (error) {
    const message =
      (error as AxiosError<{ message?: string }>).response?.data?.message || '获取模板列表失败'
    showToast(message, 'error')
  } finally {
    loading.value = false
  }
}

async function selectTemplate(id: number) {
  selectedId.value = id
  loading.value = true
  try {
    const detail = await fetchTemplateById(id)
    applyTemplate(detail)
  } catch (error) {
    const message =
      (error as AxiosError<{ message?: string }>).response?.data?.message || '获取模板详情失败'
    showToast(message, 'error')
  } finally {
    loading.value = false
  }
}

function applyTemplate(template: TemplateItem) {
  form.name = template.name
  form.description = template.description || ''
  form.slogan = template.slogan || ''
  form.aspectRatio = template.aspectRatio || '3:4'
  form.canvasWidth = template.canvasSize?.width || 1080
  form.canvasHeight = template.canvasSize?.height || 1440
  backgroundMeta.width = form.canvasWidth
  backgroundMeta.height = form.canvasHeight
  form.photoArea = {
    ...defaultArea,
    ...template.photoArea
  }
  form.logoPosition = template.logoPosition || 'top-left'
  const templateAspect =
    (template.canvasSize?.width && template.canvasSize?.height
      ? template.canvasSize.width / template.canvasSize.height
      : backgroundAspectRatio.value) || 1
  selectedRatioPixels.value = Number(
    ((form.photoArea.ratio || defaultArea.ratio || 1) * templateAspect).toFixed(4)
  )
  form.backgroundUrl = template.backgroundUrl || ''
  form.logoUrl = template.logoUrl || ''
  updatePreview('background', form.backgroundUrl, false)
  updatePreview('logo', form.logoUrl, false)
  fileState.background = null
  fileState.logo = null
  removeBackgroundAsset.value = false
  removeLogoAsset.value = false
}

function resetForm() {
  form.name = ''
  form.description = ''
  form.slogan = ''
  form.aspectRatio = '3:4'
  form.canvasWidth = 1080
  form.canvasHeight = 1440
  form.photoArea = { ...defaultArea }
  form.logoPosition = 'top-left'
  const aspect = backgroundAspectRatio.value || 1
  selectedRatioPixels.value = Number(((defaultArea.ratio || 1) * aspect).toFixed(4))
  form.backgroundUrl = ''
  form.logoUrl = ''
  fileState.background = null
  fileState.logo = null
  updatePreview('background', '', false)
  updatePreview('logo', '', false)
  removeBackgroundAsset.value = false
  removeLogoAsset.value = false
}

function startCreateTemplate() {
  selectedId.value = null
  resetForm()
}

function updatePreview(key: 'background' | 'logo', value: string, isObjectUrl: boolean) {
  if (fileState.objectUrl[key] && fileState.preview[key]) {
    URL.revokeObjectURL(fileState.preview[key])
  }
  fileState.preview[key] = value
  fileState.objectUrl[key] = isObjectUrl
}

function handleBackgroundChange(file: File) {
  fileState.background = file
  updatePreview('background', URL.createObjectURL(file), true)
  removeBackgroundAsset.value = false
}

function handleLogoChange(file: File) {
  fileState.logo = file
  updatePreview('logo', URL.createObjectURL(file), true)
  removeLogoAsset.value = false
}

function clearBackground() {
  fileState.background = null
  form.backgroundUrl = ''
  updatePreview('background', '', false)
  backgroundMeta.width = 1080
  backgroundMeta.height = 1440
  form.photoArea = applyRatioToArea({ ...defaultArea }, selectedRatioPixels.value)
  removeBackgroundAsset.value = true
  showToast('背景图已清除', 'info')
}

function clearLogo() {
  fileState.logo = null
  form.logoUrl = ''
  updatePreview('logo', '', false)
  removeLogoAsset.value = true
  showToast('LOGO 已清除', 'info')
}

async function handleSave() {
  if (!form.name) {
    showToast('请填写模板名称', 'error')
    return
  }
  if (!fileState.preview.background && !form.backgroundUrl) {
    showToast('请上传背景图', 'error')
    return
  }
  form.photoArea = applyRatioToArea(form.photoArea, selectedRatioPixels.value)
  ensureCanvasSizeSync()

  saving.value = true
  try {
    const payload = {
      name: form.name,
      description: form.description,
      slogan: form.slogan,
      aspectRatio: form.aspectRatio,
      canvasWidth: form.canvasWidth,
      canvasHeight: form.canvasHeight,
      logoPosition: form.logoPosition,
      photoArea: form.photoArea,
      removeBackground: removeBackgroundAsset.value,
      removeLogo: removeLogoAsset.value,
      backgroundFile: fileState.background,
      logoFile: fileState.logo
    }
    if (isCreating.value) {
      const { id } = await createTemplate(payload)
      selectedId.value = id
    } else if (selectedId.value) {
      await updateTemplate(selectedId.value, payload)
    }
    showToast('模板已保存', 'success')
    await loadTemplates()
  } catch (error) {
    const message =
      (error as AxiosError<{ message?: string }>).response?.data?.message || '保存失败'
    showToast(message, 'error')
  } finally {
    saving.value = false
    removeBackgroundAsset.value = false
    removeLogoAsset.value = false
  }
}

async function handleDelete() {
  if (isCreating.value || !selectedId.value) return
  const confirmed = window.confirm('确认删除当前模板？删除后不可恢复。')
  if (!confirmed) return
  try {
    await deleteTemplate(selectedId.value)
    showToast('模板已删除', 'success')
    selectedId.value = null
    await loadTemplates()
  } catch (error) {
    const message =
      (error as AxiosError<{ message?: string }>).response?.data?.message || '删除失败'
    showToast(message, 'error')
  }
}

const activeTemplateName = computed(() => {
  if (isCreating.value) return '新模板'
  return templates.value.find((tpl) => tpl.id === selectedId.value)?.name || '模板详情'
})
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-semibold text-primary-500 uppercase tracking-widest">Templates</p>
        <h2 class="text-2xl font-bold text-slate-900">模板管理</h2>
        <p class="text-sm text-slate-500">
          上传背景 / LOGO、配置标语与照片区域，实时预览效果。
        </p>
      </div>
      <div class="flex gap-3">
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          @click="startCreateTemplate"
        >
          新建模板
        </button>
        <button
          v-if="!isCreating"
          type="button"
          class="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          @click="handleDelete"
        >
          删除
        </button>
        <button
          type="button"
          class="rounded-lg bg-primary-500 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-primary-600 disabled:opacity-60"
          :disabled="saving"
          @click="handleSave"
        >
          {{ saving ? '保存中...' : '保存配置' }}
        </button>
      </div>
    </header>
    <div class="grid gap-6 xl:grid-cols-[320px,1fr]">
      <div class="space-y-4">
        <div
          class="rounded-2xl bg-white shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden"
        >
          <div class="px-5 py-4 flex items-center justify-between">
            <p class="text-sm font-semibold text-slate-700">模板列表</p>
            <span class="text-xs text-slate-400">共 {{ templates.length }} 个</span>
          </div>
          <div class="max-h-[520px] overflow-auto">
            <button
              v-for="template in templates"
              :key="template.id"
              type="button"
              class="flex w-full items-center gap-3 px-5 py-4 text-left transition"
              :class="
                template.id === selectedId
                  ? 'bg-primary-50/70 text-primary-700'
                  : 'hover:bg-slate-50 text-slate-600'
              "
              @click="selectTemplate(template.id)"
            >
              <div class="h-10 w-10 rounded-xl bg-slate-100 overflow-hidden">
                <img
                  v-if="template.logoUrl"
                  :src="template.logoUrl"
                  class="h-full w-full object-contain"
                  alt="logo"
                />
              </div>
              <div>
                <p class="text-sm font-semibold">{{ template.name }}</p>
                <p class="text-xs text-slate-400">
                  {{ template.slogan || '暂无标语' }}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div class="space-y-6">
        <section class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-slate-500">当前模板</p>
              <h3 class="text-xl font-bold text-slate-900">{{ activeTemplateName }}</h3>
            </div>
            <span
              class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
            >
              {{ form.aspectRatio }} · {{ form.canvasWidth }}×{{ form.canvasHeight }}
            </span>
          </div>
          <div class="grid gap-4 lg:grid-cols-2">
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-700">模板名称</span>
              <input
                v-model="form.name"
                type="text"
                class="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500"
                placeholder="2024 校友返校模板"
              />
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-700">模板描述</span>
              <input
                v-model="form.description"
                type="text"
                class="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500"
                placeholder="补充说明"
              />
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-700">标语文案</span>
              <input
                v-model="form.slogan"
                type="text"
                class="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500"
                placeholder="欢迎校友返校日"
              />
            </label>
          </div>
          <div class="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p>背景尺寸：{{ backgroundSizeLabel }}</p>
            <p class="text-xs text-slate-400">
              自动同步最新上传的背景图宽高，生成画布将完全贴合原图比例。
            </p>
          </div>
          <div class="grid gap-8 lg:grid-cols-2">
            <UploadImage
              label="背景图"
              hint="推荐尺寸 1080x1440，PNG/JPG"
              :preview-url="fileState.preview.background || form.backgroundUrl"
              @change="handleBackgroundChange"
            />
            <UploadImage
              label="LOGO 图"
              hint="透明底 PNG 更佳"
              :preview-url="fileState.preview.logo || form.logoUrl"
              @change="handleLogoChange"
            />
            <div class="flex flex-wrap gap-3 text-sm text-slate-600 lg:col-span-2">
              <button
                type="button"
                class="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50 disabled:opacity-40"
                :disabled="!(fileState.preview.background || form.backgroundUrl)"
                @click="clearBackground"
              >
                清除背景图
              </button>
              <button
                type="button"
                class="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50 disabled:opacity-40"
                :disabled="!(fileState.preview.logo || form.logoUrl)"
                @click="clearLogo"
              >
                清除 LOGO
              </button>
            </div>
          </div>
        </section>
        <section class="grid gap-6 xl:grid-cols-2">
          <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-slate-500">照片区域</p>
                <p class="text-xs text-slate-400">
                  拖拽底图生成照片区域，自动返回 x/y/width/height/ratio
                </p>
              </div>
            </div>
            <CanvasSelector
              v-model="form.photoArea"
              :image-url="fileState.preview.background || form.backgroundUrl"
              :locked-ratio="normalizedLockedRatio"
              :aspect-ratio="backgroundAspectRatio"
              @change="handleAreaChange"
            />
            <div class="flex flex-wrap items-center gap-2 text-xs">
              <span class="text-slate-500">固定比例：</span>
              <button
                v-for="option in ratioOptions"
                :key="option.value"
                type="button"
                class="rounded-lg border px-3 py-1 font-medium transition"
                :class="
                  Math.abs(option.value - selectedRatioPixels) < 0.001
                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                "
                @click="setRatio(option.value)"
              >
                {{ option.label }}
              </button>
              <span class="text-slate-400">当前 {{ selectedRatioPixels.toFixed(2) }} : 1</span>
            </div>
            <div class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              <p>X: {{ (form.photoArea.x * 100).toFixed(1) }}%</p>
              <p>Y: {{ (form.photoArea.y * 100).toFixed(1) }}%</p>
              <p>宽: {{ (form.photoArea.width * 100).toFixed(1) }}%</p>
              <p>高: {{ (form.photoArea.height * 100).toFixed(1) }}%</p>
            </div>
          </div>
          <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-slate-500">实时预览</p>
                <p class="text-xs text-slate-400">叠加 LOGO 与标语效果</p>
              </div>
            </div>
            <div
              class="relative w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-100"
              :style="{ aspectRatio: backgroundAspectRatio }"
            >
              <img
                v-if="fileState.preview.background || form.backgroundUrl"
                :src="fileState.preview.background || form.backgroundUrl"
                class="h-full w-full object-contain"
                alt="预览"
              />
              <div
                v-else
                class="absolute inset-0 flex items-center justify-center text-slate-400"
              >
                请上传背景图以查看预览
              </div>
              <img
                v-if="fileState.preview.logo || form.logoUrl"
                :src="fileState.preview.logo || form.logoUrl"
                class="absolute h-16 w-16 object-contain drop-shadow-lg"
                :class="previewLogoClass"
                alt="logo"
              />
              <p class="absolute inset-x-0 bottom-6 text-center text-white text-xl font-semibold drop-shadow-lg">
                {{ form.slogan || '欢迎校友返校日' }}
              </p>
              <div
                class="absolute border-2 border-white/70 shadow-lg"
                :style="photoAreaPreviewStyle"
              />
            </div>
            <div class="space-y-2">
              <p class="text-xs font-semibold text-slate-500">LOGO 位置</p>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="option in logoPositionOptions"
                  :key="option.value"
                  type="button"
                  class="rounded-lg border px-3 py-2 text-sm font-medium"
                  :class="
                    option.value === form.logoPosition
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  "
                  @click="handleLogoPositionChange(option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
    <ToastMessage
      v-if="toast.visible"
      :message="toast.message"
      :type="toast.type"
      @close="toast.visible = false"
    />
  </section>
</template>
