<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const menus = [
  { name: 'templates', label: '模板管理' },
  { name: 'gallery', label: '往届合照' },
  { name: 'stats', label: '统计图表' }
]

const activeName = computed(() => route.name)

function handleLogout() {
  authStore.logout()
  router.replace({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex">
    <aside
      class="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white/90 backdrop-blur"
    >
      <div class="px-6 py-6 border-b border-slate-200">
        <p class="text-lg font-semibold text-primary-600">校友返校 · 后台</p>
        <p class="text-sm text-slate-500">校友返校管理中心</p>
      </div>
      <nav class="flex-1 px-4 py-6 space-y-2">
        <RouterLink
          v-for="menu in menus"
          :key="menu.name"
          :to="{ name: menu.name }"
          class="block rounded-lg px-4 py-2 text-sm font-medium transition"
          :class="
            activeName === menu.name
              ? 'bg-primary-500 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          "
        >
          {{ menu.label }}
        </RouterLink>
      </nav>
      <div class="px-4 py-4 border-t border-slate-200">
        <button
          type="button"
          class="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          @click="handleLogout"
        >
          退出登录
        </button>
      </div>
    </aside>
    <div class="flex-1 flex flex-col">
      <header class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div>
          <p class="text-base font-semibold text-slate-900">
            {{ route.meta.title || '控制台' }}
          </p>
          <p class="text-sm text-slate-500">校友返校后台管理系统</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-slate-500 hidden sm:inline-flex">
            {{ authStore.isAuthenticated ? '管理员就绪' : '未登录' }}
          </span>
          <button
            type="button"
            class="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary-600"
            @click="handleLogout"
          >
            退出
          </button>
        </div>
      </header>
      <main class="flex-1 overflow-y-auto p-4 sm:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
