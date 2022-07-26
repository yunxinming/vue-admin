import { GET, POST, DEL, PUT } from './http'
import type { menuType } from '@/views/system/menu/types'
import type { restPasswordType, UserType } from '@/views/system/user/types'
import type { RoleType, RolePage } from '@/views/system/role/types'

interface Page<T> {
  countId: string
  current: number
  maxLimit: number
  optimizeCountSql: boolean
  orders: []
  pages: number
  records: T
  searchCount: boolean
  size: number
  total: number
}

export const Login = POST<{ userName: string; password: string }, string>('/admin/login')
export const UserRouter = GET<any, menuType[]>('/admin/router')
export const CurrentUserInfo = GET<any, UserType>('/admin/current/user')
export const UpdateUserOne = POST<Partial<UserType>, any>('/admin/update/user')
export const ChangeUserPassword = POST<Partial<{ password: string; newPassword: string }>, any>('/admin/change/user/password')
export const Logout = GET('/logout')
export const UserList = (currentPage: number, pageSize: number) => GET<{ username: string | null }, Page<UserType[]>>(`/admin/user/${currentPage}/${pageSize}`)
export const SaveUsers = POST<UserType[], any>('/admin/user')
export const RemoveUsers = DEL<UserType[], any>('/admin/user')
export const UpdateUsers = PUT<any, any>('/admin/user')
export const restPassword = POST<restPasswordType[], any>('/admin/rest/password')

// menu
export const MenuList = GET<any, menuType[]>('/admin/menus')
export const SaveMenus = POST<menuType[], any>('/admin/menus')
export const UpdateMenus = PUT<menuType[], any>('/admin/menus')
export const RemoveMenus = DEL<menuType[], any>('/admin/menus')

// role
export const UserRoleAll = GET<any, RoleType[]>('/admin/user/role')
export const RoleList = (page: RolePage) => GET<any, Page<RoleType[]>>(`/admin/role/${page.currentPage}/${page.pageSize}`)
export const SaveRoles = POST<RoleType[], any>('/admin/role')
export const EditRoles = PUT<RoleType[], any>('/admin/role')
export const DeleteRoles = DEL<RoleType[], any>('/admin/role')
export const RoleMenus = GET<any, menuType[]>('/admin/role/menu')
export const getChecked = (roleId: number) => GET<any, number[]>(`/admin/checked/${roleId}`)
export const updateRoleMenus = POST<{ roleId: number; menuId: number }[], any>('/admin/update/roleOrMenu')
export const deleteRoleMenus = POST<{ roleId: number; menuId: number }[], any>('/admin/delete/roleOrMenu')
