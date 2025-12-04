import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/Login.vue'),
      meta: { public: true }
    },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: { name: 'templates' } },
        {
          path: 'templates',
          name: 'templates',
          component: () => import('@/pages/Templates.vue'),
          meta: { title: '模板管理' }
        },
        {
          path: 'gallery',
          name: 'gallery',
          component: () => import('@/pages/Gallery.vue'),
          meta: { title: '往届合照' }
        },
        {
          path: 'stats',
          name: 'stats',
          component: () => import('@/pages/Stats.vue'),
          meta: { title: '统计概览' }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'templates' }
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta.public && auth.isAuthenticated) {
    return next({ name: 'templates' })
  }

  next()
})

export default router
