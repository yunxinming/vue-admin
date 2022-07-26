<script setup lang="ts" name="sys_user">
import {defineComponent, h, inject, onMounted, reactive, ref} from 'vue'
import type {UserType, restPasswordType} from './types'
import {UserList, SaveUsers, RemoveUsers, UserRoleAll, UpdateUsers, restPassword} from '@/http'
import {NButton, NButtonGroup, NInput, useDialog, useMessage} from 'naive-ui'
import type {VxeGridEvents, VxeGridInstance, VxeGridProps, VxeTablePropTypes} from 'vxe-table'
import VXETable from 'vxe-table'
import type {RoleType} from '../role/types'
import usePerms from "@/hooks/usePerms";

const message = useMessage()
const dialog = useDialog()
const disabledUserName = ref(false)
const repossessPasswordInput = ref<string>('')
const roles = ref<Partial<RoleType>[]>()
const xGrid = ref<VxeGridInstance>()
const searchUserName = ref<string | null>(null)
const contentHeight = inject('height') as number
const columnsWidth = '20%'
const gridOptions = reactive<VxeGridProps>({
  border: true,
  showHeaderOverflow: true,
  showOverflow: true,
  keepSource: true,
  id: 'user_table',
  rowConfig: {
    keyField: 'userId',
    isHover: true,
  },
  filterConfig: {
    remote: true,
  },
  columnConfig: {
    resizable: true,
  },
  editConfig: {
    trigger: 'click',
    mode: 'row',
    showStatus: true,
    beforeEditMethod({row}): boolean {
      const perms = usePerms()
      const isInsert = xGrid.value?.isInsertByRow(row) || false
      const f = Array.of(...['system:user:add', 'system:user:edit']).every(p => perms.includes(p))
      if (f) {
        return true
      }
      if (perms.includes('system:user:edit')) {
        return true
      }
      return perms.includes('system:user:add') && isInsert
    }
  },
  editRules: {
    userName: [
      {required: true, message: '用户名必填'},
      {min: 3, max: 50, message: '名称长度在 3 到 10 个字符'},
    ],
    nickName: [{required: true, message: '用户昵称必须填写'}],
  },
  customConfig: {
    storage: true,
    checkMethod({column}) {
      if (['userName', 'roleIds', 'nickName'].includes(column.field)) {
        return false
      }
      return true
    },
  },
  columns: [
    {type: 'checkbox', title: 'ID', visible: true, width: 80},
    {
      title: '用户名称',
      field: 'userName',
      editRender: {},
      slots: {edit: 'edit_userName'},
      visible: true,
      width: columnsWidth,
    },
    {
      title: '用户昵称',
      field: 'nickName',
      editRender: {name: 'input', attrs: {placeholder: '请输入用户昵称'}},
      visible: true,
      width: columnsWidth,
    },
    {
      title: '用户角色',
      field: 'roleIds',
      editRender: {name: '$select', options: [], props: {placeholder: '请选择角色', multiple: true}},
      width: columnsWidth,
    },
    {
      title: '用户性别',
      field: 'sex',
      sortable: true,
      filterMultiple: false,
      visible: false,
      editRender: {
        name: '$select',
        options: [
          {label: '女', value: '1'},
          {label: '男', value: '0'},
          {label: '保密', value: '2'},
        ],
        props: {placeholder: '请选择性别'},
      },
      width: columnsWidth,
    },
    {title: '用户邮箱', field: 'email', editRender: {name: 'input', attrs: {placeholder: '请输入用户邮箱'}}, width: columnsWidth},
    {
      title: '手机号码',
      field: 'phonenumber',
      editRender: {name: 'input', attrs: {placeholder: '请输入手机号码'}},
      width: columnsWidth,
    },
    {
      title: '用户状态',
      field: 'status',
      editRender: {
        name: '$select',
        options: [
          {label: '启用', value: '0'},
          {label: '禁用', value: '1'},
        ],
        props: {placeholder: '请选择'},
      },
      width: columnsWidth,
    },
    {title: '用户备注', field: 'remark', editRender: {name: 'input', attrs: {placeholder: '请输入用户备注'}}, width: columnsWidth},
  ],
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 15, 20, 50, 100],
  },
  toolbarConfig: {
    buttons: [
      {code: 'insert_actived', name: '新增'},
      {code: 'delete', name: '删除'},
      // { code: 'mark_cancel', name: '删除/取消' },
      {code: 'save', name: '保存', status: 'success'},
    ],
    slots: {buttons: 'tool_btn'},
    refresh: true,
    import: false,
    export: false,
    print: false,
    zoom: true,
    custom: true,
  },
  checkboxConfig: {
    labelField: 'userId',
    reserve: true,
    highlight: true,
    range: true,
  },

  proxyConfig: {
    seq: true, // 启用动态序号代理，每一页的序号会根据当前页数变化
    sort: true, // 启用排序代理，当点击排序时会自动触发 query 行为
    filter: true, // 启用筛选代理，当点击筛选时会自动触发 query 行为
    form: true, // 启用表单代理，当点击表单提交按钮时会自动触发 reload 行为
    // 对应响应结果 { result: [], page: { total: 100 } }
    props: {
      result: 'data.records', // 配置响应结果列表字段
      total: 'data.total', // 配置响应结果总页数字段
    },
    message: false,
    ajax: {
      query: ({page, sorts, filters, form}) => {
        const res = UserList(page.currentPage, page.pageSize)
        const result = res({username: searchUserName.value})
        result.then(({data}) => {
          userList.value = data.records
        })
        return result
      },
      save: ({body}) => {
        let errorMessage = ''
        const UserNameText = userList.value?.map((u) => u?.userName)
        const insertData = body.insertRecords.map((u) => {
          if (UserNameText?.includes(u.userName)) {
            errorMessage = u.userName + ' 用户名已存在'
          }
          u.userId = null
          return u
        })
        if (errorMessage !== '') {
          return new Promise((resolve, reject) => {
            reject(message.error(errorMessage))
          })
        }
        return insertData.length !== 0
            ? SaveUsers([...insertData]).then(({code, msg}) => {
              if (code === 200) {
                message.success(msg)
              } else {
                message.error(msg)
              }
            })
            : UpdateUsers([...body.updateRecords]).then(({code, msg}) => {
              if (code === 200) {
                message.success(msg)
              } else {
                message.error(msg)
              }
            })
      },
      delete: ({body}) => {
        if (body.removeRecords && body.removeRecords.length === 0) {
          return Promise.resolve()
        }
        return RemoveUsers(body.removeRecords).then(({code, msg}) => {
          if (code === 200) {
            message.success(msg)
          } else {
            message.error(msg)
          }
        })
      },
    },
  },
})

const userList = ref<Partial<UserType[]>>()

async function getUserList() {
  try {
    const {code, msg, data} = await UserList(1, 10)()
    userList.value = data.records
  } catch (error) {
    message.error('未知错误，获取用户列表失败')
  }
}

const editActivedEvent: VxeGridEvents.EditDisabled = (options) => {
  disabledUserName.value = options.row.userName !== null && !options.$table.isInsertByRow(options.row)
}
const tableCheckboxConfig = reactive({
  labelField: 'userId',
  checkMethod: ({row}: { row: UserType }) => {
    return row.userId > 2
  },
  // visibleMethod({ row }: { row: any }) {
  //   return row.sex === 'Women'
  // },
})

async function getRoleAll() {
  const {data} = await UserRoleAll()
  roles.value = data
  const {formConfig, columns} = gridOptions
  if (columns) {
    const roleColumn = columns[3]
    const result: any[] = []
    data.forEach((r) => {
      result.push({label: r.roleName, value: r.roleId?.toString()})
    })
    if (roleColumn && roleColumn.editRender) {
      roleColumn.editRender.options = result
    }
  }
}

function insertData(row: any) {
  xGrid.value?.insert(row)
}

function deleteData() {
  const recordset = xGrid.value?.getCheckboxRecords()
  if (recordset && recordset?.length === 0) {
    return message.info('至少选择一条数据')
  }
  dialog.info({
    closable: false,
    title: '删除选中的数据',
    negativeText: '取消',
    positiveText: '确定',
    onPositiveClick() {
      xGrid.value?.commitProxy('delete')
    },
  })
}

function save() {
  const recordset = xGrid.value?.getRecordset()
  if (recordset?.insertRecords.length === 0 && recordset?.updateRecords.length === 0) {
    return message.info('没有数据更改')
  }
  xGrid.value?.commitProxy('save')
}

function query() {
  xGrid.value?.commitProxy('query')
  searchUserName.value = null
}

function handleKeyUp(e: KeyboardEvent) {
  if (e.code === 'Enter') {
    query()
  }
}

function onPositiveClick(rowData: UserType[]) {
  if (repossessPasswordInput.value && repossessPasswordInput.value.length !== 0) {
    const result = rowData.map((u) => {
      const res: restPasswordType = {userId: '', password: ''}
      res.userId = u.userId
      res.password = repossessPasswordInput.value
      return res
    })
    restPassword(result).then(({code, msg}) => {
      if (code === 200) {
        message.success(msg)
        xGrid.value?.clearCheckboxRow()
        dialog.destroyAll()
      } else {
        message.error(msg)
      }
    })
  } else {
    message.info('不能为空')
  }
}

function onNegativeClick() {
  dialog.destroyAll()
}

function repossessPassword() {
  const rowDate = xGrid.value?.getCheckboxRecords() as UserType[]
  if (rowDate?.length === 0) {
    return message.info('请至少选择一条记录！')
  }
  dialog.warning({
    title: '重置密码',
    closable: false,
    content: () =>
        h(
            NInput,
            {
              type: 'password',
              placeholder: '请输入密码',
              onInput: (val: string) => (repossessPasswordInput.value = val),
            },
            {}
        ),
    action: () =>
        h(NButtonGroup, null, {
          default: () => [
            h(NButton, {type: 'info', onClick: onNegativeClick}, {default: () => '取消'}),
            h(NButton, {type: 'warning', onClick: () => onPositiveClick(rowDate)}, {default: () => '确定'}),
          ],
        }),
    negativeText: '不确定',
  })
}

onMounted(() => {
  getRoleAll()
})
</script>

<template>
  <div class="user">
    <vxe-grid ref="xGrid" :height="contentHeight - 20" auto-resize v-bind="gridOptions" @edit-actived="editActivedEvent"
              :checkbox-config="tableCheckboxConfig">
      <template #tool_btn>
        <n-space>
          <n-input-group v-perms:system:user:query>
            <n-input v-model:value="searchUserName" @keyup="handleKeyUp" placeholder="搜索用户名称"/>
            <n-button type="primary" ghost @click="query"> 搜索</n-button>
          </n-input-group>
          <n-button-group>
            <n-button type="info" @click="insertData" v-perms:system:user:add>新增</n-button>
            <n-button type="error" @click="deleteData" v-perms:system:user:remove>删除</n-button>
            <n-button type="warning" @click="repossessPassword" v-perms:system:user:resetPwd>重置密码</n-button>
            <n-button type="success" @click="save" v-perms="['system:user:add', 'system:user:edit']">保存</n-button>
          </n-button-group>
        </n-space>
      </template>
      <template #edit_userName="{ row }">
        <vxe-input v-model="row.userName" :disabled="disabledUserName" placeholder="请输入用户名"></vxe-input>
      </template>
    </vxe-grid>
  </div>
</template>

<style lang="scss" scoped>
// .user {
// }
</style>
