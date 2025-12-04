<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  label: string
  hint?: string
  accept?: string
  previewUrl?: string | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [file: File]
}>()

const internalPreview = ref(props.previewUrl || '')
const objectUrl = ref<string | null>(null)
const inputKey = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

function revokeObjectUrl() {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = null
  }
}

function resetInput() {
  if (inputRef.value) {
    inputRef.value.value = ''
  }
  inputKey.value += 1
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || !files.length) {
    resetInput()
    return
  }
  const file = files.item(0)
  if (!file) {
    resetInput()
    return
  }
  revokeObjectUrl()
  const url = URL.createObjectURL(file)
  objectUrl.value = url
  internalPreview.value = url
  emit('change', file)
  resetInput()
}

watch(
  () => props.previewUrl,
  (value) => {
    if (value) {
      revokeObjectUrl()
      internalPreview.value = value || ''
    } else {
      internalPreview.value = ''
    }
    resetInput()
  }
)

onBeforeUnmount(() => {
  revokeObjectUrl()
})
</script>

<template>
  <label class="block space-y-2">
    <span class="text-sm font-medium text-slate-700">{{ label }}</span>
    <div
      class="relative rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 hover:border-primary-400 transition"
    >
      <input
        :key="inputKey"
        ref="inputRef"
        type="file"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        :accept="accept"
        :disabled="disabled"
        @change="handleFileChange"
      />
      <div class="flex flex-col items-center justify-center gap-2 text-slate-500 text-sm">
        <div
          class="h-24 w-full rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center"
        >
          <img
            v-if="internalPreview"
            :src="internalPreview"
            alt="Preview"
            class="h-full w-full object-contain"
          />
          <span v-else class="text-xs text-slate-400">选择图片后立即预览</span>
        </div>
        <p class="font-medium text-primary-600">点击或拖拽图片到此上传</p>
        <p class="text-xs text-slate-400">{{ hint || '支持 JPG/PNG，最大 5MB' }}</p>
      </div>
    </div>
  </label>
</template>
