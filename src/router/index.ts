import { createRouter, createWebHistory } from 'vue-router'
import useAddRouter from '@/hooks/useAddRouter'
import Home from '../views/Home.vue'
import Login from '@/views/Login.vue'
import Layout from '@/layout/Layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/admin',
      name: 'admin',
      component: Layout,
      redirect: '/admin/home',
      children: [
        {
          path: 'home',
          name: 'home',
          component: Home,
          meta: {
            menuid: '10',
            breadcrumb: ['首页'],
            isLogin: true,
          },
        },
        {
          name: 'userinfo',
          path: 'system/user/edit',
          meta: {
            menuid: '20',
            breadcrumb: ['首页', '编辑用户信息'],
            isLogin: true,
          },
          component: () => import('../views/system/user/info.vue'),
        },
      ],
    },
  ],
})
useAddRouter(router)
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.isLogin && !token) {
    return next({ name: 'login' })
  }
  next()
})
export default router
