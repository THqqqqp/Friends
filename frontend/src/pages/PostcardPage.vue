<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import TemplatePicker from "@/components/TemplatePicker.vue";
import ImageUploader from "@/components/ImageUploader.vue";
import PhotoEditorCanvas from "@/components/PhotoEditorCanvas.vue";
import ResultPreview from "@/components/ResultPreview.vue";
import { usePostcardStore } from "@/stores/postcardStore";
import type { FrameStyle } from "@/types/postcard";

const store = usePostcardStore();
const templatesLoading = ref(true);

const steps = [
  { key: "template", title: "选择模板", desc: "挑选喜欢的背景" },
  { key: "photo", title: "上传照片", desc: "上传并调整照片" },
  { key: "meta", title: "完善信息", desc: "填写署名与显示项" },
  { key: "preview", title: "导出分享", desc: "保存并分享" },
] as const;

const currentStep = ref(0);
const processing = ref(false);
const frameOptions: { label: string; value: FrameStyle }[] = [
  { label: "无边框", value: "none" },
  { label: "实线", value: "solid" },
  { label: "虚线", value: "dashed" },
];

const filename = computed(() => {
  const name = store.meta.displayName || "未署名";
  const college = store.meta.college || "未知学院";
  const year = store.meta.graduationYear || "20XX";
  return `Friends-${college}-${name}-${year}.png`;
});

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0:
      return Boolean(store.selectedTemplateId);
    case 1:
      return Boolean(store.userImage);
    case 2:
      return store.canGenerate;
    default:
      return true;
  }
});

const ensurePreview = async () => {
  if (store.canGenerate) {
    await store.generatePreview();
  }
};

const nextStep = async () => {
  if (!canProceed.value || currentStep.value >= steps.length - 1 || processing.value) return;
  
  processing.value = true;
  try {
    if (currentStep.value >= 1) {
      await ensurePreview();
    }
    currentStep.value += 1;
    if (currentStep.value === steps.length - 1) {
      await ensurePreview();
    }
  } finally {
    processing.value = false;
  }
};

const prevStep = () => {
  if (currentStep.value === 0) return;
  currentStep.value -= 1;
};

const schedulePreview = (() => {
  let timer: number | null = null;
  return () => {
    if (!store.canGenerate || currentStep.value === 0) return;
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      ensurePreview();
    }, 400);
  };
})();

watch(
  () => ({
    ...store.transform,
  }),
  schedulePreview,
  { deep: true }
);

watch(
  () => [
    store.meta.displayName,
    store.meta.college,
    store.meta.graduationYear,
    store.meta.showName,
    store.meta.showCollege,
    store.meta.showYear,
    store.meta.showSlogan,
    store.frameStyle,
  ],
  schedulePreview
);

watch(
  () => store.userImage,
  () => {
    if (currentStep.value >= 1) {
      schedulePreview();
    }
  }
);

watch(
  () => currentStep.value,
  (step) => {
    if (step >= 1) {
      schedulePreview();
    }
  }
);

onMounted(() => {
  (async () => {
    templatesLoading.value = true;
    await store.bootstrap();
    templatesLoading.value = false;
  })();
});
</script>

<template>
  <section
    class="min-h-screen bg-[#FDFBF7] px-4 py-4 font-sans selection:bg-emerald-100 selection:text-emerald-900"
  >
    <!-- Decorative Background Elements -->
    <div class="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        class="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl"
      ></div>
      <div
        class="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-emerald-50/50 blur-3xl"
      ></div>
    </div>

    <div class="relative mx-auto max-w-xl space-y-4">
      <!-- Navigation -->
      <div class="flex items-center justify-between">
        <RouterLink
          to="/"
          class="group flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-emerald-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
          >
            <path
              fill-rule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clip-rule="evenodd"
            />
          </svg>
          返回首页
        </RouterLink>
      </div>

      <header
        v-if="currentStep === 0"
        class="text-center md:text-left animate-fade-in-down space-y-1"
      >
        <h2 class="mt-1 font-serif text-2xl font-bold text-emerald-950">
          生成电子明信片
        </h2>
        <p class="text-xs text-emerald-800/70">
          选择模板 → 上传调整 → 填写信息 → 保存分享
        </p>
      </header>

      <!-- Steps Indicator -->
      <div
        class="flex items-center gap-2 rounded-3xl border border-emerald-100 bg-white/60 px-3 py-2 text-xs text-emerald-600/60 justify-center shadow-sm backdrop-blur-sm"
      >
        <div
          v-for="(step, index) in steps"
          :key="step.key"
          class="flex min-w-[64px] flex-shrink-0 justify-center items-center rounded-full px-3 py-1 font-semibold transition-all duration-300"
          :class="[
            index === currentStep
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : index < currentStep
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-transparent text-slate-400',
          ]"
          style="justify-content: center"
        >
          {{ step.title }}
        </div>
      </div>

      <!-- Step Content -->
      <div
        class="relative min-h-[400px] rounded-3xl bg-white/40 p-1 transition-all duration-500"
      >
        <div v-if="currentStep === 0" class="space-y-4 animate-fade-in-up">
          <div
            class="rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3 text-sm text-emerald-900 shadow-sm flex items-center justify-between"
          >
            <div>
              <p class="font-semibold">挑选学校主题模板</p>
              <p class="text-xs text-emerald-700/70">选择后即可开始制作</p>
            </div>
            <div
              v-if="templatesLoading"
              class="flex items-center gap-2 text-xs text-emerald-600"
            >
              <span
                class="h-3 w-3 animate-ping rounded-full bg-emerald-500"
              ></span>
              正在加载模板…
            </div>
          </div>
          <div
            class="rounded-2xl border border-emerald-100 bg-white/70 p-2 shadow-sm"
          >
            <TemplatePicker
              v-model="store.selectedTemplateId"
              :templates="store.templates"
            />
          </div>
        </div>

        <div v-else-if="currentStep === 1" class="space-y-4 animate-fade-in-up">
          <div
            class="flex items-start justify-between gap-3 rounded-2xl border border-emerald-100 bg-white/80 px-4 py-4 text-sm text-emerald-900 shadow-sm"
          >
            <div>
              <p class="text-base font-semibold text-emerald-950">
                上传并调整画面
              </p>
              <p class="text-xs text-emerald-700/70">
                上传后可在下方画布中拖动、缩放或旋转。
              </p>
            </div>
            <ImageUploader
              :preview="store.userImage"
              variant="button"
              @select="store.setUserImage"
            />
          </div>
          <div class="overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5">
            <PhotoEditorCanvas
              :key="`editor-${store.selectedTemplateId}-${store.userImage}`"
              v-model="store.transform"
              :template="store.selectedTemplate"
              :userImage="store.userImage"
              :frame-style="store.frameStyle"
            />
          </div>
        </div>

        <div v-else-if="currentStep === 2" class="space-y-6 animate-fade-in-up">
          <!-- <MetaInfoForm v-model="store.meta" /> -->
          <div
            class="space-y-4 rounded-3xl border border-emerald-100 bg-white/80 px-4 py-4 shadow-sm"
          >
            <div>
              <p class="text-sm font-semibold text-emerald-900">画面样式</p>
              <p class="text-xs text-emerald-700/60">此处仅调节边框效果。</p>
            </div>
            <div
              class="overflow-hidden rounded-xl shadow-md ring-1 ring-black/5"
            >
              <PhotoEditorCanvas
                :key="`meta-${store.selectedTemplateId}-${store.userImage}`"
                v-model="store.transform"
                :template="store.selectedTemplate"
                :userImage="store.userImage"
                :frame-style="store.frameStyle"
                :show-controls="false"
                :interactive="false"
              />
            </div>
            <div class="space-y-2">
              <p class="text-sm font-medium text-emerald-900">边框样式</p>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="option in frameOptions"
                  :key="option.value"
                  type="button"
                  class="rounded-2xl border px-3 py-2 text-sm font-medium transition"
                  :class="
                    store.frameStyle === option.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'border-emerald-100 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/30'
                  "
                  @click="store.setFrameStyle(option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="space-y-6 animate-fade-in-up">
          <ResultPreview
            :data-url="store.previewDataUrl"
            :filename="filename"
            :loading="store.loading"
            :aspect-ratio="store.selectedTemplate?.aspectRatio"
          />
        </div>
      </div>

      <!-- Footer Actions -->
      <div
        class="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-emerald-100/50 bg-[#FDFBF7]/95 px-6 py-4 backdrop-blur-sm sm:static sm:mx-0 sm:bg-transparent sm:p-0 sm:pt-6 sm:flex-row sm:justify-between"
      >
        <button
          type="button"
          class="rounded-2xl border border-amber-200 bg-white/50 px-5 py-2.5 text-sm font-semibold text-amber-900/80 transition hover:bg-amber-50 hover:text-amber-900 disabled:opacity-40 disabled:cursor-not-allowed"
          v-if="currentStep > 0"
          :disabled="processing"
          @click="prevStep"
        >
          ← 上一步
        </button>
        <div class="flex-1"></div>
        <button
          v-if="currentStep < steps.length - 1"
          type="button"
          class="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
          :disabled="!canProceed || processing"
          @click="nextStep"
        >
          <span v-if="processing" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          {{ processing ? "处理中..." : (currentStep === 0 ? "🚀 开始制作" : "下一步 →") }}
        </button>
      </div>
      <p
        v-if="store.error"
        class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500 shadow-sm"
      >
        {{ store.error }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out forwards;
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
