<script setup lang="ts">
defineProps<{
  open: boolean
  title?: string
  imageUrl?: string | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

function close() {
  emit('update:open', false)
}
</script>

<template>
  <transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur"
      @click.self="close"
    >
      <div class="relative max-w-5xl w-full mx-4 rounded-2xl bg-white shadow-2xl overflow-hidden">
        <header class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <p class="text-base font-semibold text-slate-900">{{ title || '图片预览' }}</p>
          <button
            type="button"
            class="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
            @click="close"
          >
            ✕
          </button>
        </header>
        <div class="max-h-[80vh] overflow-auto p-4 bg-slate-50">
          <img
            v-if="imageUrl"
            :src="imageUrl"
            alt="Preview"
            class="w-full rounded-xl shadow-sm"
          />
          <p v-else class="text-center text-slate-500 py-10">暂无图片</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
