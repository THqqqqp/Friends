import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import PostcardPage from '@/pages/PostcardPage.vue'
import GalleryPage from '@/pages/GalleryPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/postcard', name: 'postcard', component: PostcardPage },
    { path: '/gallery', name: 'gallery', component: GalleryPage }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
