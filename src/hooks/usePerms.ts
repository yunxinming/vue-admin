import type {menuType} from "@/views/system/menu/types";

export default function () {
    const perms: string[] = []
    const localMenus = localStorage.getItem('menus')
    if (localMenus !== null) {
        const menus = JSON.parse(localMenus) as menuType[]
        menus.forEach((s) => {
            if (s.perms !== '') {
                perms.push(s.perms)
            }
        })
    }
    return perms
}