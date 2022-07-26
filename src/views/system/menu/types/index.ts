export interface menuType {
  component: string
  createBy: string
  createTime: string
  icon: string | Function | boolean
  isCache: number
  isFrame: number
  menuId: number | null
  menuName: string
  menuType: string
  orderNum: number
  parentId: number
  path: string
  perms: string
  query: string
  remark: string
  status: string
  updateBy: string
  updateTime: string
  visible: string
  children?: menuType[]
  key?: string
  label?: Function | string
  type?: string
}
