<script setup lang="ts">
import type { MetaInfo } from "@/types/postcard";

const props = defineProps<{
  modelValue: MetaInfo;
}>();

const emit = defineEmits<{
  "update:modelValue": [payload: MetaInfo];
}>();

const updateField = (partial: Partial<MetaInfo>) => {
  emit("update:modelValue", { ...props.modelValue, ...partial });
};
</script>

<template>
  <div
    class="space-y-4 rounded-3xl border border-slate-200 bg-white/60 backdrop-blur-md p-5 shadow-sm transition-all duration-500 ease-out"
  >
    <p class="rounded-2xl bg-slate-50/80 px-3 py-2 text-xs text-slate-500">
      姓名/学院/年份暂时隐藏，后续版本再开放填写。
    </p>

    <div class="rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-4 transition-colors hover:bg-slate-50">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <p class="font-semibold text-slate-900">显示欢迎标语</p>
          <p class="mt-1 text-xs text-slate-500">
            关闭后预览不会展示模板自带标语和底部遮罩
          </p>
        </div>
        <label
          class="relative inline-flex cursor-pointer items-center ml-4 flex-shrink-0"
        >
          <input
            type="checkbox"
            class="peer sr-only"
            :checked="modelValue.showSlogan"
            @change="
              updateField({
                showSlogan: ($event.target as HTMLInputElement).checked,
              })
            "
          />
          <div
            class="h-7 w-12 rounded-full bg-slate-200 transition-all peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/30 peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 shadow-inner"
          ></div>
          <div
            class="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 peer-checked:translate-x-5 peer-checked:shadow-md"
          ></div>
        </label>
      </div>
    </div>
  </div>
</template>
