<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = reactive({
  account: "",
  password: "",
});

const submitting = ref(false);
const errorMessage = ref("");

async function handleSubmit() {
  if (!form.account || !form.password) {
    errorMessage.value = "请输入账号与密码";
    return;
  }
  submitting.value = true;
  errorMessage.value = "";
  try {
    await authStore.login({
      account: form.account,
      password: form.password,
    });
    const redirect = (route.query.redirect as string) || "/templates";
    router.replace(redirect);
  } catch (error) {
    errorMessage.value = (error as Error).message;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4"
  >
    <div class="w-full max-w-md rounded-2xl bg-white/95 p-8 shadow-2xl">
      <div class="text-center mb-8">
        <p
          class="text-sm uppercase tracking-widest text-primary-500 font-semibold"
        >
          校园返校明信片管理后台
        </p>
        <h1 class="text-2xl font-bold text-slate-900 mt-2">后台登录</h1>
        <p class="text-sm text-slate-500">请输入账号密码</p>
      </div>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm font-medium text-slate-700">账号</label>
          <input
            v-model="form.account"
            type="email"
            placeholder="admin@alumni.local"
            class="mt-2 w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">密码</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            class="mt-2 w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
        <p v-if="errorMessage" class="text-sm text-red-500">
          {{ errorMessage }}
        </p>
        <button
          type="submit"
          class="w-full rounded-lg bg-primary-500 py-3 text-white font-semibold shadow-lg hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="submitting"
        >
          {{ submitting ? "登录中..." : "登录" }}
        </button>
      </form>
    </div>
  </div>
</template>
