<script setup lang="ts">
import type { TemplateConfig } from '@/types/postcard'

const props = defineProps<{
  templates: TemplateConfig[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [payload: string]
}>()

const handleSelect = (id: string | number) => {
  emit('update:modelValue', String(id))
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-base font-semibold text-slate-900">选择校园模板</p>
        <p class="text-xs text-slate-500">左右滑动查看更多，当前 {{ templates.length }} 款</p>
      </div>
      <span class="text-xs text-blue-500">可横向滑动</span>
    </div>
    <div class="relative">
      <div
        class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
      >
        <button
          v-for="template in templates"
          :key="template.id"
          class="min-w-[70%] sm:min-w-[55%] lg:min-w-[38%] snap-start rounded-3xl border-2 p-3 text-left transition hover:-translate-y-0.5"
          :class="[
            modelValue === String(template.id)
              ? 'border-blue-500 bg-blue-50 shadow-lg'
              : 'border-slate-200 bg-white'
          ]"
          type="button"
          @click="handleSelect(template.id)"
        >
          <img
            :src="template.thumbnailUrl || template.backgroundUrl"
            :alt="template.name"
            class="h-40 w-full rounded-2xl object-cover"
          />
          <div class="mt-3 space-y-1">
            <p class="text-sm font-semibold text-slate-900 truncate">
              {{ template.name }}
            </p>
            <p class="text-xs text-slate-500 line-clamp-2">
              {{ template.description }}
            </p>
          </div>
        </button>
      </div>
      <div class="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white"></div>
    </div>
  </div>
</template>
