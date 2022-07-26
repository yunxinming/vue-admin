import { defineStore } from 'pinia'
import type { menuType } from '@/views/system/menu/types'
import { UserRouter } from '@/http'

export const useMenuStore = defineStore('menu', {
  state: () => ({ router: [] as menuType[], menus: [] as menuType[] }),
  actions: {
    async getRouter() {
      const localRouterTable = window.localStorage.getItem('router')
      const localMenus = window.localStorage.getItem('menus')
      if (localRouterTable && localMenus) {
        this.router = JSON.parse(localRouterTable) as menuType[]
        this.menus = JSON.parse(localMenus) as menuType[]
        return
      }
      try {
        const { data } = await UserRouter()
        this.menus = data
        this.router = this._handleRouter(data)
        window.localStorage.setItem('router', JSON.stringify(this.router))
        window.localStorage.setItem('menus', JSON.stringify(this.menus))
      } catch (error) {}
    },
    _handleRouter(router: menuType[]) {
      const routerObject: { [index: number]: menuType } = {}
      const result: { [index: number]: menuType } = {}
      router.forEach((menu) => {
        // @ts-ignore
        routerObject[menu.menuId] = menu
      })
      router.forEach((menu) => {
        if (menu.parentId === 0) {
          // @ts-ignore
          result[menu.menuId] = menu
          menu.children = []
        } else {
          routerObject[menu.parentId].children?.push(menu)
        }
      })
      return this._handleChildren(Object.values(result))
    },
    _handleChildren(router: menuType[]) {
      return router.map((m) => {
        if (m.children?.length === 0) {
          delete m.children
        }
        if (m.children && m.children.length !== 0) {
          this._handleChildren(m.children)
        }
        return m
      })
    },
  },
})
