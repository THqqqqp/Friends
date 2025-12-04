<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  message: string
  type?: 'success' | 'error' | 'info'
  title?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const colorMap = computed(() => {
  switch (props.type) {
    case 'success':
      return {
        border: 'border-emerald-200',
        bg: 'bg-emerald-50/95',
        text: 'text-emerald-700'
      }
    case 'error':
      return {
        border: 'border-red-200',
        bg: 'bg-red-50/95',
        text: 'text-red-700'
      }
    default:
      return {
        border: 'border-blue-200',
        bg: 'bg-blue-50/95',
        text: 'text-blue-700'
      }
  }
})
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        class="fixed right-4 top-4 z-50 w-full max-w-xs"
        role="alert"
      >
        <div
          class="rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur"
          :class="[colorMap.border, colorMap.bg, colorMap.text]"
        >
          <div class="flex items-start gap-3">
            <div class="flex-1">
              <p class="text-sm font-semibold">
                {{ props.title || '提示' }}
              </p>
              <p class="text-sm leading-relaxed">
                {{ props.message }}
              </p>
            </div>
            <button
              type="button"
              class="text-xs font-semibold opacity-70 hover:opacity-100"
              @click="emit('close')"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
