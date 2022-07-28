<script lang="ts" setup name="sys_role">
import type { VxeGridInstance, VxeGridProps } from 'vxe-table'
import { inject, onMounted, reactive, ref } from 'vue'
import { EditRoles, RoleList, SaveRoles, DeleteRoles, RoleMenus, getChecked, updateRoleMenus, deleteRoleMenus } from '@/http'
import { useMessage, useDialog } from 'naive-ui'
import type { TreeOption } from 'naive-ui'
import type { menuType } from '@/views/system/menu/types'
import { useMenuStore } from '@/stores/menu'
import type { RoleType } from '@/views/system/role/types'
import usePerms from '@/hooks/usePerms'

const xGrid = ref<VxeGridInstance>()
const message = useMessage()
const dialog = useDialog()
const perms = usePerms()
const height = inject('height') as number
const fieldWidth = '20%'
const menus = ref<menuType[]>([])
const menuStore = useMenuStore()
const notProcessedChecked: { [index: number]: any[] } = {}
const cacheChecked: { [index: number]: any[] } = {}
const cacheUpdateChecked = reactive<{ [index: number]: { checked: number[]; indeterminate: number[]; merge: { roleId: number; menuId: number }[] } }>({})
const GridOptions = reactive<VxeGridProps>({
  id: 'role_table',
  border: true,
  showHeaderOverflow: true,
  showOverflow: true,
  keepSource: true,
  rowConfig: {
    keyField: 'roleId',
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
    beforeEditMethod: function ({ row }): boolean {
      const isInsert = xGrid.value?.isInsertByRow(row) || false
      const f = Array.of(...['system:role:edit', 'system:role:add']).every((p) => perms.includes(p))
      if (f) {
        return true
      }
      if (perms.includes('system:role:edit')) {
        return true
      }
      return perms.includes('system:role:add') && isInsert
    },
  },
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 15, 20, 50, 100],
  },
  editRules: {
    roleName: [{ required: true, message: '角色名称必填' }],
    roleKey: [{ required: true, message: '角色标识必填' }],
    roleSort: [
      { required: true, message: '角色排序必填' },
      { pattern: '^[0-9]{0,8}$', message: '格式不对，请输入数字' },
    ],
    status: [{ required: true, message: '角色状态必填' }],
  },
  expandConfig: {
    accordion: true,
    lazy: true,
    loadMethod: async ({ row }) => {
      cacheChecked[row.roleId] = []
      const data = await getRoleMenus()
      menus.value = data
      const checked = getChecked(row.roleId)
      const { code, msg, data: check } = await checked()
      handleCheckedChildNode(data, check, row.roleId)
    },
  },
  columns: [
    { type: 'checkbox' },
    { type: 'expand', slots: { content: 'expand' } },
    { title: '角色名称', field: 'roleName', editRender: {}, slots: { edit: 'edit_roleName' }, width: fieldWidth },
    { title: '角色标识', field: 'roleKey', editRender: {}, slots: { edit: 'edit_roleKey' }, width: fieldWidth },
    {
      title: '角色排序',
      field: 'roleSort',
      sortable: true,
      editRender: {},
      slots: { edit: 'edit_roleSort' },
      width: fieldWidth,
    },
    {
      title: '角色状态',
      field: 'status',
      editRender: {},
      slots: { edit: 'edit_status', default: 'default_status' },
      width: fieldWidth,
    },
    { title: '角色备注', field: 'remark', editRender: {}, slots: { edit: 'edit_remark' }, width: fieldWidth },
  ],
  toolbarConfig: {
    slots: { buttons: 'toolbar_btn' },
    refresh: true,
    import: false,
    export: false,
    print: false,
    zoom: true,
    custom: true,
  },
  proxyConfig: {
    seq: true, // 启用动态序号代理，每一页的序号会根据当前页数变化
    sort: true, // 启用排序代理，当点击排序时会自动触发 query 行为
    filter: false, // 启用筛选代理，当点击筛选时会自动触发 query 行为
    form: false, // 启用表单代理，当点击表单提交按钮时会自动触发 reload 行为
    message: false,
    props: {
      result: 'records', // 配置响应结果列表字段
      total: 'total', // 配置响应结果总页数字段
    },
    ajax: {
      query: async ({ page, sorts, filters, form }) => {
        const result = RoleList({ currentPage: page.currentPage, pageSize: page.pageSize })
        const { code, msg, data } = await result()
        if (code !== 200) {
          message.error(msg)
        }
        return data
      },
      delete: async ({ body }) => {
        const { code, msg } = await DeleteRoles(body.removeRecords)
        if (code === 200) {
          message.success(msg)
        } else {
          message.error(msg)
        }
      },
      save: async ({ body }) => {
        if (body.insertRecords && body.insertRecords.length !== 0) {
          const { code, msg } = await SaveRoles(
            body.insertRecords.map((r) => {
              r.roleId = null
              return r
            })
          )
          if (code === 200) {
            message.success(msg)
          } else {
            message.error(msg)
          }
        }
        if (body.updateRecords && body.updateRecords.length !== 0) {
          const { code, msg } = await EditRoles(body.updateRecords)
          if (code === 200) {
            message.success(msg)
          } else {
            message.error(msg)
          }
        }
      },
    },
  },
})

function verifyPermissions(row: any) {
  const isInsert = xGrid.value?.isInsertByRow(row) || false
  const f = Array.of(...['system:role:edit', 'system:role:add']).every((p) => perms.includes(p))
  if (f) {
    return true
  }
  if (perms.includes('system:role:edit')) {
    return true
  }
  return perms.includes('system:role:add') && isInsert
}

async function insert() {
  const records = {
    status: '0',
  }
  const res = await xGrid.value?.insert(records)
  xGrid.value?.setEditRow(res?.row)
}

function save() {
  const result: { roleId: number; menuId: number }[] = []
  const removeResult: { roleId: number; menuId: number }[] = []
  for (const key in cacheUpdateChecked) {
    let k = parseInt(key)
    result.push(...cacheUpdateChecked[k].merge)
    notProcessedChecked[key].forEach((n) => {
      if (![...cacheUpdateChecked[key].checked, ...cacheUpdateChecked[key].indeterminate].includes(n)) {
        removeResult.push({ roleId: k, menuId: n })
      }
    })
  }
  const recordset = xGrid.value?.getRecordset()
  if (recordset?.insertRecords.length === 0 && recordset?.updateRecords.length === 0 && result.length === 0 && removeResult.length === 0) {
    return message.info('没有数据更改')
  }
  if (removeResult.length !== 0) {
    deleteRoleMenus(removeResult).then(({ code, msg }) => {
      if (code === 200) {
        message.success(msg)
        removeResult.forEach((res) => {
          let index = notProcessedChecked[res.roleId].findIndex((r) => r === res.menuId)
          if (index !== -1) {
            notProcessedChecked[res.roleId].splice(index, 1)
          }
        })
      } else {
        message.error(msg)
      }
    })
  }
  if (result.length !== 0) {
    updateRoleMenus(result).then(({ code, msg }) => {
      if (code === 200) {
        message.success(msg)
        result.forEach((res) => {
          let index = notProcessedChecked[res.roleId].findIndex((n) => n === res.menuId)
          if (index === -1) {
            notProcessedChecked[res.roleId].splice(0, 0, res.menuId)
          }
        })
      } else {
        message.error(msg)
      }
    })
  }
  xGrid.value?.commitProxy('save')
}

function deleteRoleRow() {
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

onMounted(() => {
  getRoleMenus()
})

function handleCheckedChildNode(menus: menuType[], keys: number[], roleId: number) {
  notProcessedChecked[roleId] = keys
  menus.forEach((m) => {
    if (!m.children) {
      if (m.menuId !== null && keys.includes(m.menuId)) {
        cacheChecked[roleId].push(m.menuId)
      }
    }
    if (m.children && m.children.length !== 0) {
      handleCheckedChildNode(m.children, keys, roleId)
    }
  })
}

async function getRoleMenus() {
  if (menus.value && menus.value?.length !== 0) return menus.value
  const { code, msg, data } = await RoleMenus()
  if (code !== 200) {
    message.error(msg)
  }
  return generateMenuTree(data)
}

function generateMenuTree(data: menuType[]) {
  const obj: { [index: number]: menuType } = {}
  const result: { [index: number]: menuType } = {}

  data.forEach((m) => {
    if (m.menuId !== null) {
      obj[m.menuId] = m
    }
  })
  data.forEach((m) => {
    m.children = []
    if (m.parentId === 0) {
      if (m.menuId !== null) {
        result[m.menuId] = m
      }
    } else {
      obj[m.parentId].children?.push(m)
    }
  })
  return menuStore._handleChildren(Object.values(result))
}

function updateCheckedKeys(keys: Array<number>, option: Array<TreeOption | null>, row: RoleType) {
  cacheUpdateChecked[row.roleId] = { checked: keys, indeterminate: [], merge: [] }
}

function updateIndeterminateKey(keys: Array<number>, option: Array<TreeOption | null>, row: RoleType) {
  cacheUpdateChecked[row.roleId].indeterminate = keys
  cacheUpdateChecked[row.roleId].merge = [...cacheUpdateChecked[row.roleId].checked, ...cacheUpdateChecked[row.roleId].indeterminate].map((n) => {
    return { roleId: row.roleId, menuId: n }
  })
}
</script>

<template>
  <div class="role">
    <vxe-grid ref="xGrid" :height="height - 59" auto-resize v-bind="GridOptions">
      <template #toolbar_btn>
        <n-button-group>
          <n-button type="info" @click="insert" v-perms:system:role:add>新增</n-button>
          <n-button type="error" @click="deleteRoleRow" v-perms:system:role:remove>删除</n-button>
          <n-button type="success" @click="save" v-perms="['system:role:edit', 'system:role:add']">保存</n-button>
        </n-button-group>
      </template>
      <template #edit_roleName="{ row }">
        <n-input v-model:value="row.roleName" placeholder="角色名称"></n-input>
      </template>
      <template #edit_roleKey="{ row }">
        <n-input v-model:value="row.roleKey" placeholder="角色标识"></n-input>
      </template>
      <template #edit_roleSort="{ row }">
        <n-input-number v-model:value="row.roleSort" clearable placeholder="角色排序" />
      </template>
      <template #edit_status="{ row }">
        <n-switch v-model:value="row.status" checked-value="0" unchecked-value="1" />
      </template>
      <template #default_status="{ row }">
        <n-switch v-model:value="row.status" :disabled="!verifyPermissions(row)" checked-value="0" unchecked-value="1" />
      </template>
      <template #edit_remark="{ row }">
        <n-input v-model:value="row.remark" placeholder="角色备注"></n-input>
      </template>
      <template #expand="{ row }">
        <n-tree
          block-line
          checkable
          cascade
          :data="menus as []"
          :disabled="!verifyPermissions(row)"
          key-field="menuId"
          label-field="menuName"
          :default-checked-keys="cacheUpdateChecked[row.roleId] ? cacheUpdateChecked[row.roleId].checked : cacheChecked[row.roleId]"
          @update:checked-keys="
            (keys, option) => {
              updateCheckedKeys(keys, option, row)
            }
          "
          @update:indeterminate-keys="
            (key, option) => {
              updateIndeterminateKey(key, option, row)
            }
          "
        />
      </template>
    </vxe-grid>
  </div>
</template>
