<script setup lang="ts" name="sys_menu">
import { useMessage, useDialog } from 'naive-ui'
import { h, onMounted, reactive, ref, nextTick, onUpdated, defineProps, inject } from 'vue'
import type { VxeGridEvents, VxeGridInstance, VxeGridProps } from 'vxe-table'
import { SaveMenus, UpdateMenus, RemoveMenus, MenuList } from '@/http'
import { random } from 'xe-utils'
import type { menuType } from './types'
import usePerms from "@/hooks/usePerms";

const message = useMessage()
const dialog = useDialog()
const height = inject('height') as number
const xGrid = ref<VxeGridInstance>()
const tableData = ref<menuType[]>()
const menuid = ref<any[]>([])
const perms = usePerms()
const disabledMenu = reactive({
  menuType: false,
  icon: false,
  component: false,
  path: false,
  btn: false,
  perms: false,
})

function verificationPerms() {
  const f = Array.of(...['system:menu:edit','system:menu:add']).every(p => perms.includes(p))
  if (f) {
    return true
  }
  if (perms.includes('system:menu:edit')) {
    return false
  }
  return true
}
const GridOptions = reactive<VxeGridProps>({
  id: 'menu_table',
  showHeaderOverflow: true,
  showOverflow: true,
  keepSource: true,
  border: true,
  rowConfig: {
    keyField: 'menuId',
    isHover: true,
  },
  columnConfig: {
    resizable: true,
  },
  treeConfig: {
    transform: true,
    rowField: 'menuId',
    parentField: 'parentId',
    indent: 16,
  },
  editConfig: {
    trigger: 'click',
    mode: 'row',
    showStatus: true,
    beforeEditMethod({row}): boolean {
      const perms = usePerms()
      const isInsert = xGrid.value?.isInsertByRow(row) || false
      const f = Array.of(...['system:menu:edit','system:menu:add']).every(p => perms.includes(p))
      if (f) {
        return true
      }
      if (perms.includes('system:menu:edit')) {
        return true
      }
      return perms.includes('system:menu:add') && isInsert
    }
  },
  customConfig: {
    checkMethod({ column }): boolean {
      if (['createBy'].includes(column.field)) {
        return verificationPerms()
      }
      return true
    }
  },
  toolbarConfig: {
    slots: { buttons: 'tool_btn' },
    refresh: true,
    import: false,
    export: false,
    print: false,
    zoom: true,
    custom: true,
  },
  editRules: {
    menuName: [{ required: true, message: '菜单名必填' }],
  },
  columns: [
    { type: 'checkbox' },
    { field: 'menuName', treeNode: true, title: '菜单名称', editRender: {}, slots: { edit: 'edit_menuName' }, width: '20%' },
    { field: 'path', title: '菜单路径', width: '20%', editRender: {}, slots: { edit: 'edit_path' } },
    { field: 'component', title: '组件路径', editRender: {}, slots: { edit: 'edit_component' }, width: '20%' },
    { field: 'perms', title: '权限标识', editRender: {}, slots: { edit: 'edit_perms' }, width: '25%' },
    { field: 'icon', title: '菜单图标', editRender: {}, slots: { edit: 'edit_icon' }, width: '20%' },
    {
      field: 'menuType',
      title: '菜单类型',
      editRender: {
        name: '$select',
        options: [
          { label: '目录', value: 'M' },
          { label: '菜单', value: 'C' },
          { label: '按钮', value: 'F' },
        ],
      },
      slots: { edit: 'edit_menu_type' },
      width: '20%',
    },
    {
      field: 'status',
      title: '菜单状态',
      editRender: { name: '$switch', props: { 'open-value': '0', 'close-value': '1' } },
      slots: { default: 'status_default' },
      width: '20%',
    },
    { field: 'remark', title: '菜单备注', editRender: {}, slots: { edit: 'edit_remark' }, width: '20%' },
    { field: "createBy", title: '菜单操作', fixed: 'right', slots: { default: 'operate' }, width: 104, visible: verificationPerms() },
  ],
  proxyConfig: {
    seq: true,
    sort: true,
    props: {
      list: 'data',
    },
    message: false,
    ajax: {
      query: async () => {
        const result = await MenuList()
        result.data.forEach((m) => {
          menuid.value?.push(m.menuId)
        })
        return result
      },
      save: ({ body }) => {
        const insertData = body.insertRecords
        return insertData.length !== 0
          ? SaveMenus(insertData).then(({ code, msg }) => {
              if (code === 200) {
                message.success(msg)
              } else {
                message.error(msg)
              }
            })
          : UpdateMenus(body.updateRecords).then(({ code, msg }) => {
              if (code === 200) {
                message.success(msg)
              } else {
                message.error(msg)
              }
            })
      },
      delete: ({ body }) => {
        return RemoveMenus(body.removeRecords).then(({ code, msg }) => {
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

async function getMenuList() {
  const { code, msg, data } = await MenuList()
  if (code === 200) {
    tableData.value = data.map((m) => {
      if (m.menuId === 0) {
        m.menuId = null
      }
      return m
    })
  }
}

const insertChildRow = async (currRow: any, type: string) => {
  const id = generateMenuID(currRow.menuId)
  const $table = xGrid.value
  const record = {
    menuId: id,
    status: '0',
    menuType: type === 'M' ? 'C' : 'F',
    parentId: currRow.menuId, // 需要指定父节点，自动插入该节点中
  }
  const row = await $table?.insert(record)
  await $table?.setTreeExpand(currRow, true) // 将父节点展开
  await $table?.setEditRow(row?.row) // 插入子节点
}

const editActivedEvent: VxeGridEvents.EditDisabled = (options) => {
  const { row, $table } = options
  const f = !$table.isInsertByRow(options.row)
  disabledMenu.menuType = row.menuType !== null
  disabledMenu.icon = row.menuType === 'F'
  disabledMenu.component = row.menuType !== 'C'
  disabledMenu.path = row.menuType === 'F'
  disabledMenu.btn = !f
  disabledMenu.perms = row.menuType === 'M'
}

const insertEvent = async (row: any) => {
  const id = generateMenuID()
  const $table = xGrid.value
  const record = {
    menuId: id,
    menuType: 'M',
    status: '0',
  }
  const res = await $table?.insertAt(record, row)
  await $table?.setEditRow(res?.row)
}

function saveRows() {
  const recordset = xGrid.value?.getRecordset()
  if (recordset?.insertRecords.length === 0 && recordset?.updateRecords.length === 0) {
    return message.info('没有数据更改')
  }
  xGrid.value?.commitProxy('save')
}

function removeRows() {
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

function generateMenuID(start: number = 1000): number {
  const v = random(start, 100 + start)
  if (menuid.value.includes(v)) {
    return generateMenuID(start)
  }
  menuid.value.push(v)
  return v
}

onMounted(() => {

})

onUpdated(() => {

})
</script>

<template>
  <div class="menu">
    <vxe-grid ref="xGrid" :height="height - 20" v-bind="GridOptions" auto-resize @edit-actived="editActivedEvent">
      <template #tool_btn="{ row }">
        <n-button-group>
          <n-button type="info" @click="insertEvent(row)" v-perms:system:menu:add>新增</n-button>
          <n-button type="warning" @click="removeRows" v-perms:system:menu:remove>删除</n-button>
          <n-button type="success" @click="saveRows" v-perms="['system:menu:edit','system:menu:add']">保存</n-button>
        </n-button-group>
      </template>
      <template #status_default="{ row }">
        {{ row.status === '0' ? '启用' : '禁用' }}
      </template>
      <template #edit_menuName="{ row }">
        <n-input v-model:value="row.menuName" placeholder="请输入菜单名"></n-input>
      </template>
      <template #edit_path="{ row }">
        <n-input v-model:value="row.path" :disabled="disabledMenu.path" placeholder="请输入路径"></n-input>
      </template>
      <template #edit_component="{ row }">
        <n-input v-model:value="row.component" :disabled="disabledMenu.component" placeholder="请输入组件路径"></n-input>
      </template>
      <template #edit_perms="{ row }">
        <n-input v-model:value="row.perms" :disabled="disabledMenu.perms" placeholder="请输入权限标识"></n-input>
      </template>
      <template #edit_icon="{ row }">
        <n-input v-model:value="row.icon" :disabled="disabledMenu.icon" placeholder="请输入图标"></n-input>
      </template>
      <template #edit_menu_type="{ row }">
        <n-select
          v-model:value="row.menuType"
          :disabled="disabledMenu.menuType"
          :options="[
            { label: '目录', value: 'M' },
            { label: '菜单', value: 'C' },
            { label: '按钮', value: 'F' },
          ]"
        ></n-select>
      </template>
      <template #edit_remark="{ row }">
        <n-input v-model:value="row.remark" placeholder="请输入菜单备注"></n-input>
      </template>
      <template #operate="{ row }">
        <n-space v-if="row.menuType !== 'F'">
          <NButton :type="row.menuType === 'M' ? 'primary' : 'info'" @click="insertChildRow(row, row.menuType)">
            {{ row.menuType === 'M' ? '添加菜单' : '添加按钮' }}
          </NButton>
        </n-space>
      </template>
    </vxe-grid>
  </div>
</template>

<style lang="scss" scoped>
// .menu {
// }
</style>
