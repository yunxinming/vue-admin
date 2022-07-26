import type { menuType } from '@/views/system/menu/types'
import type { Router } from 'vue-router'

export default function useAddRouter(router: Router) {
  const menu = JSON.parse(window.localStorage.getItem('router') || '[]') as menuType[]
  menu.forEach((m) => {
    if (m.children && m.children.length !== 0) {
      m.children.forEach((cm) => {
        // @ts-ignore
        const id = cm.menuId.toString()
        router.addRoute('admin', {
          path: `/admin/${m.path}/${cm.path}`,
          meta: {
            breadcrumb: [m.menuName, cm.menuName],
            menuid: id,
            menuParentId: cm.parentId.toString(),
            isLogin: true,
          },
          component: () => import(`../views/${m.path}/${cm.path}/index.vue`),
        })
      })
    }
  })
}
