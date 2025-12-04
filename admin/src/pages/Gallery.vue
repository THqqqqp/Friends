<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import type { AxiosError } from "axios";
import UploadImage from "@/components/UploadImage.vue";
import PreviewModal from "@/components/PreviewModal.vue";
import type { GalleryPhoto } from "@/types/api";
import {
  buildDownloadUrl,
  deleteGalleryPhoto,
  fetchGallery,
  uploadGalleryPhoto,
  updateGalleryPhoto,
} from "@/services/galleryService";

const filters = reactive({
  college: "",
  className: "",
  graduationYear: "",
});

const uploadForm = reactive({
  college: "",
  className: "",
  graduationYear: "",
  title: "",
  file: null as File | null,
});
const collegeOptions = [
  "智能制造学院",
  "城市建设学院",
  "物联网技术学院",
  "汽车工程学院",
  "艺术设计学院",
  "商务管理学院",
  "旅游管理学院",
  "学前教育学院",
];

const gallery = ref<GalleryPhoto[]>([]);
const loading = ref(false);
const uploading = ref(false);
const editing = ref(false);
const selected = ref<Set<number>>(new Set());
const previewUrl = ref("");
const previewOpen = ref(false);
const feedback = ref("");
const uploadProgress = ref(0);
const uploadPreview = ref("");
const uploadPreviewIsObjectUrl = ref(false);
const editPreview = ref("");
const editPreviewIsObjectUrl = ref(false);
const editingPhotoId = ref<number | null>(null);
const editForm = reactive({
  college: "",
  className: "",
  graduationYear: "",
  title: "",
  file: null as File | null,
});

const hasSelection = computed(() => selected.value.size > 0);
const toast = reactive({
  visible: false,
  message: "",
  type: "info" as "info" | "success" | "error",
});

function showToast(
  message: string,
  type: "info" | "success" | "error" = "info",
  duration = 2500
) {
  toast.message = message;
  toast.type = type;
  toast.visible = true;
  window.setTimeout(() => {
    toast.visible = false;
  }, duration);
}

onMounted(() => {
  loadGallery();
});

onBeforeUnmount(() => {
  if (uploadPreviewIsObjectUrl.value && uploadPreview.value) {
    URL.revokeObjectURL(uploadPreview.value);
  }
  if (editPreviewIsObjectUrl.value && editPreview.value) {
    URL.revokeObjectURL(editPreview.value);
  }
});

async function loadGallery() {
  loading.value = true;
  try {
    gallery.value = await fetchGallery({
      college: filters.college || undefined,
      className: filters.className || undefined,
      graduationYear: filters.graduationYear || undefined,
    });
  } catch (error) {
    feedback.value =
      (error as AxiosError<{ message?: string }>).response?.data?.message ||
      "获取合照失败";
  } finally {
    loading.value = false;
  }
}

function handleFileChange(file: File) {
  uploadForm.file = file;
  if (uploadPreviewIsObjectUrl.value && uploadPreview.value) {
    URL.revokeObjectURL(uploadPreview.value);
  }
  uploadPreview.value = URL.createObjectURL(file);
  uploadPreviewIsObjectUrl.value = true;
}

function handleEditFileChange(file: File) {
  editForm.file = file;
  if (editPreviewIsObjectUrl.value && editPreview.value) {
    URL.revokeObjectURL(editPreview.value);
  }
  editPreview.value = URL.createObjectURL(file);
  editPreviewIsObjectUrl.value = true;
}

async function handleUpload() {
  if (!uploadForm.college || !uploadForm.graduationYear || !uploadForm.file) {
    showToast("学院、年份与图片为必填项", "error");
    return;
  }
  uploading.value = true;
  uploadProgress.value = 0;
  feedback.value = "正在上传（0%），请勿关闭页面...";
  try {
    await uploadGalleryPhoto(
      {
        college: uploadForm.college,
        className: uploadForm.className || undefined,
        graduationYear: uploadForm.graduationYear,
        title: uploadForm.title,
        file: uploadForm.file,
      },
      {
        onUploadProgress: (percent) => {
          uploadProgress.value = percent;
          feedback.value = `正在上传（${percent}%），请稍候...`;
        },
        timeoutMs: 120000,
      }
    );
    showToast("上传成功，正在刷新列表...", "success");
    Object.assign(uploadForm, {
      // 保留上次选择的学院，便于连续上传同学院的班级
      college: uploadForm.college,
      className: "",
      graduationYear: "",
      title: "",
      file: null,
    });
    if (uploadPreviewIsObjectUrl.value && uploadPreview.value) {
      URL.revokeObjectURL(uploadPreview.value);
    }
    uploadPreview.value = "";
    await loadGallery();
    feedback.value = "上传成功";
    uploadProgress.value = 0;
  } catch (error) {
    feedback.value =
      (error as AxiosError<{ message?: string }>).response?.data?.message ||
      "上传失败";
    showToast(feedback.value, "error");
    uploadProgress.value = 0;
  } finally {
    uploading.value = false;
  }
}

function openEdit(photo: GalleryPhoto) {
  editingPhotoId.value = photo.id;
  editForm.college = photo.college;
  editForm.className = photo.className || "";
  editForm.graduationYear = photo.graduationYear;
  editForm.title = photo.title || "";
  editForm.file = null;
  if (editPreviewIsObjectUrl.value && editPreview.value) {
    URL.revokeObjectURL(editPreview.value);
  }
  editPreview.value = photo.previewUrl || photo.imageUrl;
  editPreviewIsObjectUrl.value = false;
  editing.value = true;
}

function closeEdit() {
  editing.value = false;
  editingPhotoId.value = null;
  editForm.file = null;
  if (editPreviewIsObjectUrl.value && editPreview.value) {
    URL.revokeObjectURL(editPreview.value);
  }
  editPreview.value = "";
}

async function handleUpdate() {
  if (!editingPhotoId.value) return;
  uploading.value = true;
  uploadProgress.value = 0;
  feedback.value = "正在更新...";
  try {
    await updateGalleryPhoto(
      editingPhotoId.value,
      {
        college: editForm.college,
        className: editForm.className || undefined,
        graduationYear: editForm.graduationYear,
        title: editForm.title,
        file: editForm.file || undefined,
      },
      {
        onUploadProgress: (percent) => {
          uploadProgress.value = percent;
          feedback.value =
            percent >= 100
              ? "上传完成，正在压缩，请稍候..."
              : `正在上传（${percent}%），请稍候...`;
        },
        timeoutMs: 120000,
      }
    );
    showToast("已更新合照", "success");
    await loadGallery();
    closeEdit();
    uploadProgress.value = 0;
  } catch (error) {
    feedback.value =
      (error as AxiosError<{ message?: string }>).response?.data?.message ||
      "更新失败";
    showToast(feedback.value, "error");
    uploadProgress.value = 0;
  } finally {
    uploading.value = false;
  }
}

function toggleSelect(id: number) {
  if (selected.value.has(id)) {
    selected.value.delete(id);
  } else {
    selected.value.add(id);
  }
  selected.value = new Set(selected.value);
}

async function deleteSelected() {
  if (!selected.value.size) return;
  const confirmed = window.confirm(`确认删除 ${selected.value.size} 张合照？`);
  if (!confirmed) return;
  try {
    await Promise.all(
      Array.from(selected.value).map((id) => deleteGalleryPhoto(id))
    );
    selected.value = new Set();
    feedback.value = "已删除所选合照";
    await loadGallery();
  } catch (error) {
    feedback.value =
      (error as AxiosError<{ message?: string }>).response?.data?.message ||
      "删除失败";
  }
}

function deleteSingle(id: number) {
  selected.value = new Set([id]);
  deleteSelected();
}

function openPreview(photo: GalleryPhoto) {
  previewUrl.value = photo.previewUrl || photo.imageUrl;
  previewOpen.value = true;
}

function downloadPhoto(photo: GalleryPhoto) {
  const url = buildDownloadUrl(photo.id);
  window.open(url, "_blank");
}
</script>

<template>
  <section class="space-y-6">
    <header
      class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <p class="text-sm font-semibold text-primary-500 tracking-widest">
          往届合照管理
        </p>
        <h2 class="text-2xl font-bold text-slate-900">往届合照</h2>
        <p class="text-sm text-slate-500">
          支持按学院/班级/毕业年份维度的上传、预览、下载、批量删除与编辑。
        </p>
      </div>
      <div class="flex gap-3">
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          @click="loadGallery"
        >
          刷新列表
        </button>
        <button
          type="button"
          class="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          :disabled="!hasSelection"
          @click="deleteSelected"
        >
          批量删除
        </button>
      </div>
    </header>

    <div class="grid gap-6 lg:grid-cols-3">
      <div
        class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4 lg:col-span-1"
      >
        <p class="text-base font-semibold text-slate-800">上传合照</p>
        <div class="space-y-3">
          <label class="space-y-1 text-sm">
            <span class="font-medium text-slate-600">学院</span>
            <select
              v-model="uploadForm.college"
              class="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="" disabled>请选择学院</option>
              <option
                v-for="option in collegeOptions"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </select>
          </label>
          <label class="space-y-1 text-sm">
            <span class="font-medium text-slate-600">班级（可选）</span>
            <input
              v-model="uploadForm.className"
              type="text"
              class="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500"
              placeholder="人工智能 2311"
            />
          </label>
          <label class="space-y-1 text-sm">
            <span class="font-medium text-slate-600">毕业年份</span>
            <input
              v-model="uploadForm.graduationYear"
              type="text"
              class="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500"
              placeholder="2023"
            />
          </label>
          <label class="space-y-1 text-sm">
            <span class="font-medium text-slate-600">标题</span>
            <input
              v-model="uploadForm.title"
              type="text"
              class="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500"
              placeholder="2023 级学院大合照"
            />
          </label>
          <UploadImage
            label="上传图片"
            :preview-url="uploadPreview"
            hint="支持 JPG/PNG，建议小于 10MB"
            @change="handleFileChange"
          />
          <button
            type="button"
            class="w-full rounded-lg bg-primary-500 py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
            :disabled="uploading"
            @click="handleUpload"
          >
            {{ uploading ? "上传中..." : "提交上传" }}
          </button>
        </div>
      </div>
      <div
        class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5 lg:col-span-2"
      >
        <div class="grid gap-4 sm:grid-cols-3">
          <label class="text-sm space-y-1">
            <span class="font-medium text-slate-600">学院筛选</span>
            <select
              v-model="filters.college"
              class="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">全部学院</option>
              <option
                v-for="option in collegeOptions"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </select>
          </label>
          <label class="text-sm space-y-1">
            <span class="font-medium text-slate-600">班级筛选（可选）</span>
            <input
              v-model="filters.className"
              type="text"
              class="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500"
              placeholder="人工智能 2311"
            />
          </label>
          <label class="text-sm space-y-1">
            <span class="font-medium text-slate-600">毕业年份筛选</span>
            <input
              v-model="filters.graduationYear"
              type="text"
              class="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500"
              placeholder="2024"
            />
          </label>
          <div class="flex items-end gap-3">
            <button
              type="button"
              class="h-11 w-full rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
              @click="loadGallery"
            >
              应用筛选
            </button>
            <button
              type="button"
              class="h-11 w-full rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
              @click="
                () => {
                  filters.college = '';
                  filters.graduationYear = '';
                  loadGallery();
                }
              "
            >
              清空
            </button>
          </div>
        </div>
        <div class="max-h-[calc(100vh-300px)] overflow-auto rounded-xl border border-slate-100">
          <table class="min-w-full text-sm">
            <thead class="sticky top-0 z-10 bg-slate-50 shadow-sm">
              <tr class="text-left text-slate-500 border-b border-slate-200">
                <th class="py-3 pl-4 pr-4 font-semibold">选择</th>
                <th class="py-3 pr-4 font-semibold">预览</th>
                <th class="py-3 pr-4 font-semibold">学院 / 班级 / 毕业年份</th>
                <th class="py-3 pr-4 font-semibold">标题</th>
                <th class="py-3 pr-4 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <tr
                v-for="photo in gallery"
                :key="photo.id"
                class="border-b border-slate-100 last:border-none hover:bg-slate-50/50"
              >
                <td class="py-3 pl-4 pr-4">
                  <input
                    type="checkbox"
                    :checked="selected.has(photo.id)"
                    @change="toggleSelect(photo.id)"
                    class="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td class="py-3 pr-4">
                  <button
                    type="button"
                    class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    @click="openPreview(photo)"
                  >
                    预览
                  </button>
                </td>
                <td class="py-3 pr-4">
                  <p class="font-medium text-slate-800">{{ photo.college }}</p>
                  <p class="text-xs text-slate-500">
                    {{ photo.className || "—" }}
                  </p>
                  <p class="text-xs text-slate-400">
                    {{ photo.graduationYear }}
                  </p>
                </td>
                <td class="py-3 pr-4 text-slate-600">
                  {{ photo.title || "—" }}
                </td>
                <td class="py-3 pr-4 space-x-2">
                  <button
                    type="button"
                    class="rounded-lg border border-primary-200 px-3 py-1 text-xs text-primary-600 hover:bg-primary-50"
                    @click="downloadPhoto(photo)"
                  >
                    下载
                  </button>
                  <button
                    type="button"
                    class="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
                    @click="openEdit(photo)"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    class="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                    @click="deleteSingle(photo.id)"
                  >
                    删除
                  </button>
                </td>
              </tr>
              <tr v-if="!gallery.length && !loading">
                <td colspan="5" class="py-12 text-center text-slate-400">
                  暂无数据，尝试调整筛选或上传新合照。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <p
      v-if="feedback"
      class="text-sm font-medium"
      :class="toast.type === 'error' ? 'text-red-500' : 'text-primary-600'"
    >
      {{ feedback }}
    </p>
    <PreviewModal
      v-model:open="previewOpen"
      :image-url="previewUrl"
      title="合照预览"
    />

    <!-- Edit Modal -->
    <div
      v-if="editing"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-base font-semibold text-slate-900">编辑合照信息</p>
          <button
            type="button"
            class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-slate-200"
            @click="closeEdit"
          >
            关闭
          </button>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="text-sm space-y-1">
            <span class="font-medium text-slate-600">学院</span>
            <select
              v-model="editForm.college"
              class="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="" disabled>请选择学院</option>
              <option v-for="option in collegeOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </label>
          <label class="text-sm space-y-1">
            <span class="font-medium text-slate-600">班级（可选）</span>
            <input
              v-model="editForm.className"
              type="text"
              class="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500"
              placeholder="人工智能 2311"
            />
          </label>
          <label class="text-sm space-y-1">
            <span class="font-medium text-slate-600">毕业年份</span>
            <input
              v-model="editForm.graduationYear"
              type="text"
              class="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500"
              placeholder="2023"
            />
          </label>
          <label class="text-sm space-y-1">
            <span class="font-medium text-slate-600">标题</span>
            <input
              v-model="editForm.title"
              type="text"
              class="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500"
              placeholder="毕业合影标题"
            />
          </label>
        </div>
        <UploadImage
          label="更新图片（可选）"
          :preview-url="editPreview"
          hint="不上传则保留原图"
          @change="handleEditFileChange"
        />
        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            @click="closeEdit"
          >
            取消
          </button>
          <button
            type="button"
            class="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
            :disabled="uploading"
            @click="handleUpdate"
          >
            {{ uploading ? "更新中..." : "保存修改" }}
          </button>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="toast.visible"
        class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-4 py-2 text-sm text-white"
        :class="
          toast.type === 'error'
            ? 'bg-red-500'
            : toast.type === 'success'
            ? 'bg-emerald-500'
            : 'bg-slate-600'
        "
      >
        {{ toast.message }}
      </div>
    </transition>
  </section>
</template>
