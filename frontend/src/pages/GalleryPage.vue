<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { usePostcardStore } from "@/stores/postcardStore";
import type { GalleryItem } from "@/types/postcard";

const store = usePostcardStore();
const previewOpen = ref(false);
const previewImage = ref("");
const hdImage = ref("");
const hdLoaded = ref(false);
const previewTitle = ref("");
const searchHint = ref("");
const hasSearched = ref(false);

const handleSearch = async () => {
  if (!store.galleryFilters.college || !store.galleryFilters.graduationYear) {
    searchHint.value = "请先填写学院和毕业年份再搜索";
    store.gallery = [];
    return;
  }
  searchHint.value = "";
  hasSearched.value = true;
  await store.loadGallery();
};

function openPreview(item: GalleryItem) {
  previewImage.value = item.previewUrl || item.imageUrl;
  hdImage.value = item.imageUrl;
  hdLoaded.value = false;
  previewTitle.value = `${item.college} · ${item.graduationYear}`;
  previewOpen.value = true;
}

function closePreview() {
  previewOpen.value = false;
  previewImage.value = "";
  previewTitle.value = "";
  previewTitle.value = "";
}

const colleges = [
  "智能制造学院",
  "城市建设学院",
  "物联网技术学院",
  "汽车工程学院",
  "艺术设计学院",
  "商务管理学院",
  "旅游管理学院",
  "学前教育学院",
];
</script>

<template>
  <section
    class="min-h-screen bg-[#FDFBF7] px-4 py-0 font-sans selection:bg-emerald-100 selection:text-emerald-900"
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

    <div class="relative mx-auto max-w-4xl space-y-5">
      <!-- Navigation -->
      <div class="flex items-center justify-between">
        <RouterLink
          to="/"
          class="group flex items-center gap-1 rounded-full bg-white/60 px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-emerald-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
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

      <header class="text-center md:text-left animate-fade-in-down">
        <p
          class="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-600/60"
        >
          XXXXX学校
        </p>
        <h2 class="mt-1 font-serif text-2xl font-bold text-emerald-950">
          历届毕业合照
        </h2>
      </header>

      <form
        class="grid gap-3 rounded-3xl border border-emerald-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm md:grid-cols-4 animate-fade-in-up"
        @submit.prevent="handleSearch"
      >
        <label class="flex items-center text-xs font-semibold text-emerald-900">
          <div class="w-16 shrink-0 flex justify-end items-center mr-3">
            <span class="text-red-500 mr-0.5">*</span>
            <span>学院</span>
          </div>
          <div class="relative flex-1">
            <select
              v-model="store.galleryFilters.college"
              class="w-full appearance-none rounded-xl border border-emerald-100 bg-white px-3 py-2 text-base text-emerald-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              :class="{ 'text-slate-400': !store.galleryFilters.college }"
            >
              <option value="" disabled selected>请选择学院</option>
              <option
                v-for="c in colleges"
                :key="c"
                :value="c"
                class="text-emerald-900"
              >
                {{ c }}
              </option>
            </select>
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-emerald-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="h-4 w-4"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </label>
        <label class="flex items-center text-xs font-semibold text-emerald-900">
          <div class="w-16 shrink-0 flex justify-end items-center mr-3">
            <span>班级</span>
          </div>
          <input
            type="text"
            v-model="store.galleryFilters.className"
            placeholder="人工智能2311"
            class="flex-1 rounded-xl border border-emerald-100 bg-white px-3 py-2 text-base text-emerald-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </label>
        <label class="flex items-center text-xs font-semibold text-emerald-900">
          <div class="w-16 shrink-0 flex justify-end items-center mr-3">
            <span class="text-red-500 mr-0.5">*</span>
            <span>年份</span>
          </div>
          <input
            type="text"
            v-model="store.galleryFilters.graduationYear"
            maxlength="4"
            class="flex-1 rounded-xl border border-emerald-100 bg-white px-3 py-2 text-base text-emerald-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="2016"
          />
        </label>
        <div class="flex items-end md:col-span-1">
          <button
            type="submit"
            class="w-full rounded-xl bg-emerald-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700 hover:shadow-emerald-500/30 active:scale-95"
          >
            搜索合照
          </button>
        </div>
      </form>
      <p
        v-if="searchHint"
        class="text-center text-xs font-semibold text-emerald-700 animate-fade-in-up"
      >
        {{ searchHint }}
      </p>

      <div
        v-if="store.gallery.length"
        class="grid gap-6 md:grid-cols-2 animate-fade-in-up delay-100"
      >
        <article
          v-for="item in store.gallery"
          :key="item.id"
          class="group overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5 transition hover:shadow-xl"
        >
          <div class="relative aspect-[4/3] overflow-hidden bg-slate-100">
            <img
              :src="item.previewUrl || item.imageUrl"
              :alt="item.college"
              class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100"
            ></div>
          </div>
          <div class="p-5">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-serif text-lg font-bold text-emerald-950">
                  {{ item.college }}
                </p>
                <p class="text-sm font-medium text-emerald-700">
                  {{ item.graduationYear }}届 · {{ item.className || "学院级" }}
                </p>
              </div>
              <span
                class="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-600"
              >
                {{ new Date(item.createdAt).toLocaleDateString() }}
              </span>
            </div>

            <button
              type="button"
              class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 hover:text-emerald-800"
              @click="openPreview(item)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="h-4 w-4"
              >
                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                <path
                  fill-rule="evenodd"
                  d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clip-rule="evenodd"
                />
              </svg>
              查看高清大图
            </button>
          </div>
        </article>
      </div>

      <p
        v-else
        class="rounded-3xl bg-white/60 px-4 py-12 text-center text-sm text-slate-500 shadow-sm ring-1 ring-emerald-100/50 animate-fade-in-up"
      >
        {{
          hasSearched
            ? "未搜索到相关合照，请检查输入信息"
            : "请输入学院/班级/毕业年份后点击搜索，再查看合照。"
        }}
      </p>

      <!-- Preview Modal -->
      <div
        v-if="previewOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/90 px-4 py-6 backdrop-blur-sm transition-all duration-300"
      >
        <div
          class="w-full max-w-2xl space-y-4 rounded-3xl bg-white p-4 shadow-2xl animate-fade-in-up"
        >
          <div class="flex items-center justify-between px-2">
            <p class="text-sm font-bold text-emerald-900 truncate pr-4">
              {{ previewTitle }}
            </p>
            <button
              type="button"
              class="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
              @click="closePreview"
            >
              关闭
            </button>
          </div>
          <div
            class="relative max-h-[75vh] overflow-auto rounded-2xl bg-slate-50 ring-1 ring-black/5"
          >
            <!-- 纯 img，便于微信长按；高清图加载完成后覆盖 -->
            <img
              :src="previewImage"
              :alt="previewTitle"
              class="w-full rounded-2xl object-contain"
              @load="hdLoaded = false"
            />
            <img
              v-if="hdImage"
              :src="hdImage"
              :alt="previewTitle"
              loading="lazy"
              class="absolute inset-0 w-full rounded-2xl object-contain transition-opacity duration-300"
              :class="hdLoaded ? 'opacity-100' : 'opacity-0'"
              @load="hdLoaded = true"
            />
            <div
              v-if="!hdLoaded"
              class="absolute inset-0 flex items-center justify-center bg-white/40 text-xs font-medium text-emerald-800 pointer-events-none"
            >
              <div class="flex flex-col items-center gap-2">
                <div
                  class="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"
                ></div>
                高清图加载中… 加载完成后长按图片保存
              </div>
            </div>
          </div>
          <p class="text-center text-xs text-slate-600">
            高清图加载完成后长按上方图片即可保存或分享
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out forwards;
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
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

.delay-100 {
  animation-delay: 100ms;
}
</style>
