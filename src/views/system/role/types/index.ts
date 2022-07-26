export interface RoleType {
  createBy: string
  createTime: Date
  dataScope: string
  delFlag: string
  deptCheckStrictly: number
  menuCheckStrictly: number
  remark: string
  roleId: number
  roleKey: string
  roleName: string
  roleSort: number
  status: string
  updateBy: string
  updateTime: Date
}

export interface RolePage {
  currentPage: number
  pageSize: number
}
