<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import type { PhotoArea } from '@/types/api'

const props = withDefaults(
  defineProps<{
    modelValue: PhotoArea
    imageUrl?: string | null
    disabled?: boolean
    lockedRatio?: number | null
    aspectRatio?: number | null
  }>(),
  {
    modelValue: () => ({
      x: 0.1,
      y: 0.1,
      width: 0.8,
      height: 0.6,
      ratio: 1
    }),
    imageUrl: '',
    lockedRatio: null,
    aspectRatio: 0.75
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: PhotoArea]
  change: [value: PhotoArea]
}>()

const containerRef = ref<HTMLDivElement>()
const selection = reactive<PhotoArea>({ ...props.modelValue })
const startPoint = ref({ x: 0, y: 0 })
const isDrawing = ref(false)
const imageRatio = ref<number | null>(null)

watch(
  () => props.modelValue,
  (value) => {
    if (!value) return
    Object.assign(selection, value)
  },
  { deep: true }
)

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}

function beginDraw(event: PointerEvent) {
  if (props.disabled || !props.imageUrl) return
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  event.preventDefault()
  const startX = clamp((event.clientX - rect.left) / rect.width)
  const startY = clamp((event.clientY - rect.top) / rect.height)
  startPoint.value = { x: startX, y: startY }
  updateSelection(startX, startY, startX, startY)
  isDrawing.value = true
  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', finishDraw)
}

function handlePointerMove(event: PointerEvent) {
  if (!isDrawing.value) return
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  const currentX = clamp((event.clientX - rect.left) / rect.width)
  const currentY = clamp((event.clientY - rect.top) / rect.height)
  updateSelection(startPoint.value.x, startPoint.value.y, currentX, currentY)
}

function updateSelection(startX: number, startY: number, currentX: number, currentY: number) {
  const deltaX = currentX - startX
  const deltaY = currentY - startY

  let width = Math.abs(deltaX)
  let height = Math.abs(deltaY)
  const lockedRatio = props.lockedRatio && props.lockedRatio > 0 ? props.lockedRatio : null

  if (lockedRatio) {
    if (width > height * lockedRatio) {
      height = width / lockedRatio
    } else {
      width = height * lockedRatio
    }
  }

  let x = deltaX >= 0 ? startX : startX - width
  let y = deltaY >= 0 ? startY : startY - height

  const bounded = keepInsideBounds(x, y, width, height, lockedRatio)

  Object.assign(selection, {
    ...bounded,
    ratio: Number((bounded.width / bounded.height || lockedRatio || 1).toFixed(4))
  })
}

function keepInsideBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  ratio: number | null
) {
  let nextX = clamp(x)
  let nextY = clamp(y)
  let nextWidth = width + (x - nextX)
  let nextHeight = height + (y - nextY)

  if (nextX + nextWidth > 1) {
    nextWidth = 1 - nextX
  }
  if (nextY + nextHeight > 1) {
    nextHeight = 1 - nextY
  }

  if (ratio) {
    nextWidth = Math.min(nextWidth, 1 - nextX)
    nextHeight = nextWidth / ratio
    if (nextY + nextHeight > 1) {
      nextHeight = 1 - nextY
      nextWidth = nextHeight * ratio
    }
  }

  nextWidth = Math.max(nextWidth, 0.01)
  nextHeight = Math.max(nextHeight, 0.01)

  return { x: nextX, y: nextY, width: nextWidth, height: nextHeight }
}

function finishDraw() {
  if (!isDrawing.value) return
  isDrawing.value = false
  emit('update:modelValue', { ...selection })
  emit('change', { ...selection })
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', finishDraw)
}

function handleImageLoad(event: Event) {
  const img = event.target as HTMLImageElement
  if (img.naturalWidth && img.naturalHeight) {
    imageRatio.value = Number((img.naturalWidth / img.naturalHeight).toFixed(4))
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', finishDraw)
})

const selectionStyle = computed(() => ({
  top: `${selection.y * 100}%`,
  left: `${selection.x * 100}%`,
  width: `${selection.width * 100}%`,
  height: `${selection.height * 100}%`
}))

const containerAspectRatio = computed(() => {
  if (props.aspectRatio && props.aspectRatio > 0) {
    return `${props.aspectRatio}`
  }
  if (imageRatio.value) {
    return `${imageRatio.value}`
  }
  return '0.75'
})
</script>

<template>
  <div class="space-y-2">
    <div
      ref="containerRef"
      class="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
      :style="{ aspectRatio: containerAspectRatio }"
      @pointerdown="beginDraw"
    >
      <template v-if="imageUrl">
        <img
          :src="imageUrl"
          alt="Template preview"
          class="h-full w-full object-contain select-none pointer-events-none"
          @load="handleImageLoad"
        />
        <div class="absolute inset-0 pointer-events-none">
          <div
            class="absolute border-2 border-amber-400 bg-amber-400/10 shadow-lg transition-all"
            :style="selectionStyle"
          >
            <div class="absolute -top-6 left-0 text-xs font-medium text-amber-600">
              {{ (selection.width * 100).toFixed(0) }}% ×
              {{ (selection.height * 100).toFixed(0) }}%
            </div>
          </div>
        </div>
      </template>
      <div v-else class="flex h-full items-center justify-center text-slate-400 text-sm">
        请先上传背景图
      </div>
    </div>
    <div class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
      <div class="flex flex-wrap gap-4">
        <p>X: {{ (selection.x * 100).toFixed(1) }}%</p>
        <p>Y: {{ (selection.y * 100).toFixed(1) }}%</p>
        <p>宽: {{ (selection.width * 100).toFixed(1) }}%</p>
        <p>高: {{ (selection.height * 100).toFixed(1) }}%</p>
        <p>比例: {{ selection.ratio || imageRatio || 'N/A' }}</p>
        <p v-if="imageRatio">底图宽高比: {{ imageRatio }}</p>
      </div>
    </div>
  </div>
</template>
