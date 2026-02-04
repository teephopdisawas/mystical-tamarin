import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Index',
    component: () => import('@/pages/Index.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/Dashboard.vue')
  },
  {
    path: '/notes',
    name: 'Notes',
    component: () => import('@/pages/Notes.vue')
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: () => import('@/pages/Gallery.vue')
  },
  {
    path: '/messaging',
    name: 'Messaging',
    component: () => import('@/pages/Messaging.vue')
  },
  {
    path: '/calculator',
    name: 'Calculator',
    component: () => import('@/pages/Calculator.vue')
  },
  {
    path: '/todo',
    name: 'TodoList',
    component: () => import('@/pages/TodoList.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
