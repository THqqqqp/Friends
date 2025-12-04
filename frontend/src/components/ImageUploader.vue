<script setup lang="ts">
import { computed, ref } from "vue";

const props = withDefaults(
  defineProps<{
    preview?: string;
    loading?: boolean;
    variant?: "card" | "button";
  }>(),
  {
    variant: "card",
  }
);

const emit = defineEmits<{
  select: [file: File];
}>();

const instructions = computed(() =>
  props.preview ? "重新上传照片以更新卡片" : "请上传一张照片"
);

const isButtonVariant = computed(() => props.variant === "button");
const fileInput = ref<HTMLInputElement | null>(null);

const handleChange = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (!files || !files.length) return;
  emit("select", files[0]!);
};

const triggerSelect = () => {
  if (props.loading) return;
  fileInput.value?.click();
};
</script>

<template>
  <div>
    <input
      v-if="isButtonVariant"
      ref="fileInput"
      type="file"
      accept="image/*"
      class="sr-only"
      @change="handleChange"
    />

    <div v-if="isButtonVariant" class="flex flex-col items-start gap-1">
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-400 hover:text-blue-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="loading"
        @click="triggerSelect"
      >
        <span v-if="!loading" class="text-base leading-none">📷</span>
        <span
          v-else
          class="inline-block h-3 w-3 animate-spin rounded-full border border-slate-400 border-r-transparent"
        ></span>
        {{ preview ? "重新上传" : "上传照片" }}
      </button>
      <p class="text-[11px] text-slate-400">{{ instructions }}</p>
    </div>

    <label
      v-else
      class="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-blue-200 bg-white/60 backdrop-blur-md px-6 py-10 text-center transition hover:border-blue-400 active:scale-[0.99]"
    >
      <input
        type="file"
        accept="image/*"
        class="sr-only"
        @change="handleChange"
      />

      <div class="mb-5 flex w-full justify-center">
        <div
          v-if="preview"
          class="flex h-40 w-full max-w-[260px] items-center justify-center overflow-hidden rounded-2xl bg-slate-100 shadow-md md:h-48 md:max-w-[300px]"
        >
          <img
            :src="preview"
            alt="上传预览"
            class="h-full w-full object-cover"
          />
        </div>
        <div
          v-else
          class="group flex h-40 w-full max-w-[260px] flex-col items-center justify-center rounded-2xl bg-slate-50/80 shadow-inner transition-colors hover:bg-blue-50/50 md:h-48 md:max-w-[300px]"
        >
          <span class="text-5xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">📸</span>
          <p class="mt-3 text-sm font-medium text-slate-600">
            点击上传个人照片
          </p>
        </div>
      </div>

      <p class="text-sm text-slate-500">
        {{ instructions }}
      </p>
    </label>
  </div>
</template>
