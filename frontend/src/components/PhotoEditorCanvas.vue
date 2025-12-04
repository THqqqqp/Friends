<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { FrameStyle, PhotoTransform, TemplateConfig } from '@/types/postcard'

const props = withDefaults(
  defineProps<{
    template?: TemplateConfig
    userImage?: string
    modelValue: PhotoTransform
    frameStyle: FrameStyle
    showControls?: boolean
    interactive?: boolean
  }>(),
  {
    showControls: true,
    interactive: true
  }
)

const emit = defineEmits<{
  'update:modelValue': [payload: PhotoTransform]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const localTransform = ref<PhotoTransform>({ ...props.modelValue })
const isDragging = ref(false)
const dragOrigin = ref({ x: 0, y: 0 })

const areaLabel = computed(() => {
  if (!props.template) return ''
  const { width, height } = props.template.photoArea
  const ratio = (width / height).toFixed(2)
  return `嵌入区域：${ratio}:1`
})

const frameStyleLabel = computed(() => {
  const map: Record<FrameStyle, string> = {
    none: '无',
    solid: '实线',
    dashed: '虚线',
    stamp: '邮票'
  }
  return map[props.frameStyle] || '无'
})

watch(
  () => props.modelValue,
  (val) => {
    localTransform.value = { ...val }
  },
  { deep: true }
)

const emitUpdate = (partial: Partial<PhotoTransform>) => {
  const next = { ...localTransform.value, ...partial }
  localTransform.value = next
  emit('update:modelValue', next)
}

const draw = async () => {
  if (!props.template || !props.userImage) return
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const bg = await loadImage(props.template.backgroundUrl)
  const portrait = await loadImage(props.userImage)

  canvas.width = bg.naturalWidth || props.template.canvasSize.width
  canvas.height = bg.naturalHeight || props.template.canvasSize.height

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

  const area = {
    x: props.template.photoArea.x * canvas.width,
    y: props.template.photoArea.y * canvas.height,
    width: props.template.photoArea.width * canvas.width,
    height: props.template.photoArea.height * canvas.height
  }

  ctx.save()
  ctx.beginPath()
  ctx.rect(area.x, area.y, area.width, area.height)
  ctx.clip()

  const portraitWidth = portrait.naturalWidth || canvas.width
  const portraitHeight = portrait.naturalHeight || canvas.height
  const coverScale = Math.max(area.width / portraitWidth, area.height / portraitHeight)
  const totalScale = coverScale * localTransform.value.scale
  const drawWidth = portraitWidth * totalScale
  const drawHeight = portraitHeight * totalScale

  const centerX = area.x + area.width / 2 + localTransform.value.offsetX
  const centerY = area.y + area.height / 2 + localTransform.value.offsetY

  ctx.translate(centerX, centerY)
  ctx.rotate((localTransform.value.rotation * Math.PI) / 180)
  ctx.drawImage(portrait, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
  ctx.restore()

  drawFrame(ctx, area, props.frameStyle)
}

onMounted(draw)
watch(
  () => [props.template, props.userImage, localTransform.value, props.frameStyle],
  () => draw(),
  { deep: true }
)

const handlePointerDown = (event: PointerEvent) => {
  if (!props.interactive) return
  event.preventDefault()
  isDragging.value = true
  dragOrigin.value = { x: event.clientX, y: event.clientY }
}

const handlePointerMove = (event: PointerEvent) => {
  if (!isDragging.value || !props.interactive) return
  event.preventDefault()
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  const deltaX = event.clientX - dragOrigin.value.x
  const deltaY = event.clientY - dragOrigin.value.y
  dragOrigin.value = { x: event.clientX, y: event.clientY }
  emitUpdate({
    offsetX: localTransform.value.offsetX + deltaX * scaleX,
    offsetY: localTransform.value.offsetY + deltaY * scaleY
  })
}

const handlePointerUp = () => {
  if (!props.interactive) return
  isDragging.value = false
}

const resetTransform = () => {
  emitUpdate({
    scale: 1,
    rotation: 0,
    offsetX: 0,
    offsetY: 0
  })
}

const imageCache = new Map<string, HTMLImageElement>()

function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!)
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageCache.set(src, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = src
  })
}

function drawFrame(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }, style: FrameStyle) {
  ctx.save()
  ctx.lineWidth = 6
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.setLineDash([])

  if (style === 'none') {
    ctx.restore()
    return
  }

  if (style === 'dashed') {
    ctx.setLineDash([20, 12])
  } else if (style === 'stamp') {
    drawStampBorder(ctx, area)
    ctx.restore()
    return
  }

  ctx.beginPath()
  ctx.rect(area.x, area.y, area.width, area.height)
  ctx.stroke()
  ctx.restore()
}

function drawStampBorder(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }) {
  const radius = 8
  const spacing = radius * 2

  const drawCircles = (startX: number, startY: number, dx: number, dy: number, count: number, rotate = 0) => {
    ctx.save()
    ctx.translate(startX, startY)
    ctx.rotate(rotate)
    for (let i = 0; i < count; i++) {
      ctx.beginPath()
      ctx.arc(0, 0, radius, Math.PI, 0)
      ctx.fillStyle = '#fff'
      ctx.fill()
      ctx.translate(spacing * dx, spacing * dy)
    }
    ctx.restore()
  }

  drawCircles(area.x, area.y, 1, 0, Math.ceil(area.width / spacing))
  drawCircles(area.x + area.width, area.y, 0, 1, Math.ceil(area.height / spacing), Math.PI / 2)
  drawCircles(area.x + area.width, area.y + area.height, -1, 0, Math.ceil(area.width / spacing), Math.PI)
  drawCircles(area.x, area.y + area.height, 0, -1, Math.ceil(area.height / spacing), -Math.PI / 2)
}
</script>

<template>
  <div class="space-y-4">
    <div
      class="relative rounded-3xl bg-slate-900/90 p-4 text-white"
      v-if="template && userImage"
    >
      <canvas
        ref="canvasRef"
        class="h-auto max-h-80 w-full rounded-2xl bg-slate-800 object-contain"
        :class="
          props.interactive
            ? 'cursor-grab touch-none'
            : 'cursor-default pointer-events-none'
        "
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointerleave="handlePointerUp"
      ></canvas>
      <div class="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-200">
        <p>{{ areaLabel }}</p>
        <p>当前边框：{{ frameStyleLabel }}</p>
      </div>
    </div>
    <p v-else class="rounded-3xl bg-slate-100 px-4 py-10 text-center text-sm text-slate-500">
      请选择模板并上传照片后可进行编辑
    </p>

    <div
      v-if="props.showControls"
      class="grid gap-6 rounded-3xl border border-slate-200 bg-white/60 backdrop-blur-md p-6 shadow-sm"
    >
      <label class="flex flex-col gap-3 text-sm font-medium text-slate-700">
        <div class="flex justify-between">
          <span>缩放</span>
          <span class="text-slate-400">{{ Math.round(localTransform.scale * 100) }}%</span>
        </div>
        <input
          type="range"
          min="0.6"
          max="2"
          step="0.02"
          class="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          :value="localTransform.scale"
          @input="emitUpdate({ scale: Number(($event.target as HTMLInputElement).value) })"
        />
      </label>
      <label class="flex flex-col gap-3 text-sm font-medium text-slate-700">
        <div class="flex justify-between">
          <span>旋转</span>
          <span class="text-slate-400">{{ localTransform.rotation }}°</span>
        </div>
        <input
          type="range"
          min="-45"
          max="45"
          step="1"
          class="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          :value="localTransform.rotation"
          @input="emitUpdate({ rotation: Number(($event.target as HTMLInputElement).value) })"
        />
      </label>
      <button
        type="button"
        class="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-blue-600 active:scale-95"
        @click="resetTransform"
      >
        <span class="text-lg leading-none">↺</span>
        重置调整
      </button>
    </div>
  </div>
</template>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.4);
  transition: transform 0.1s;
  margin-top: -6px; /* Adjust for vertical alignment if needed, though h-2 is 8px, thumb is 20px */
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 8px;
  cursor: pointer;
  background: transparent;
  border-radius: 999px;
}
</style>
