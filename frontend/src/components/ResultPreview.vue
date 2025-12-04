<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  dataUrl?: string;
  filename: string;
  loading?: boolean;
  showDownloadButton?: boolean;
  aspectRatio?: string;
}>();

const ratioPadding = computed(() => {
  if (!props.aspectRatio) return "133%";
  const [w, h] = props.aspectRatio.split(":").map(Number);
  if (!w || !h) return "133%";
  return `${(h / w) * 100}%`;
});

const isMobile = computed(() => {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|micromessenger/i.test(navigator.userAgent);
});

const isWeChat = computed(() => {
  if (typeof navigator === "undefined") return false;
  return /micromessenger/i.test(navigator.userAgent);
});

const downloadImage = () => {
  if (!props.dataUrl) return;
  const link = document.createElement("a");
  link.href = props.dataUrl;
  link.download = props.filename || "postcard.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

</script>

<template>
  <div class="space-y-6">
    <div class="relative mx-auto w-full max-w-md">
      <div
        class="relative w-full overflow-hidden rounded-[24px] bg-white shadow-2xl ring-1 ring-black/5 transition-transform duration-500 sm:hover:scale-[1.02]"
        :style="{ paddingTop: ratioPadding }"
      >
        <div class="absolute inset-0 flex items-center justify-center bg-slate-50">
          <!-- Visible Image (Visuals only) -->
          <img
            v-if="dataUrl"
            :src="dataUrl"
            alt="合成预览"
            class="h-full w-full object-cover"
          />
          
          <!-- Invisible Overlay (Interaction only) -->
          <img
            v-if="dataUrl"
            :src="dataUrl"
            alt="长按保存"
            class="absolute inset-0 z-50 h-full w-full opacity-0"
            style="-webkit-touch-callout: default; -webkit-user-select: none; pointer-events: auto;"
          />

          <div v-else class="flex flex-col items-center gap-3 text-slate-400">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
            <p class="text-sm font-medium">正在生成明信片...</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col items-center gap-3 text-center animate-fade-in-up">
      <template v-if="isWeChat">
        <div class="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-5 py-2 text-sm font-bold text-emerald-800 shadow-sm">
          长按上方图片保存
        </div>
      </template>
      <template v-else>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700 hover:shadow-emerald-500/30 active:scale-95"
          @click="downloadImage"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
            <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
          </svg>
          保存明信片
        </button>
        <p class="text-xs text-slate-500">
          保存后可分享给好友或朋友圈
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
