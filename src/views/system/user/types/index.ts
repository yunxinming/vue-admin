export interface UserType {
  accountNonExpired: boolean
  accountNonLocked: boolean
  authorities: string
  avatar: string
  createBy: string
  createTime: Date
  credentialsNonExpired: boolean
  delFlag: string
  deptId: number
  email: string
  enabled: boolean
  loginDate: Date
  loginIp: string
  nickName: string
  password: string
  phonenumber: string
  remark: string
  sex: string
  status: string
  updateBy: string
  updateTime: Date
  userId: number | string
  userName: string
  userType: string
  username: string
  roleIds: string[]
}

export interface restPasswordType {
  userId: number | string
  password: string
}
