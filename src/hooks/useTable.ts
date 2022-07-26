import type { App } from 'vue'
import 'xe-utils'
import {
  // 全局对象
  VXETable,

  // 表格功能
  // Footer,
  Icon,
  Filter,
  Edit,
  // Menu,
  // Export,
  Keyboard,
  Validator,

  // 可选组件
  Column,
  // Colgroup,
  Grid,
  Tooltip,
  Toolbar,
  Pager,
  // Form,
  // FormItem,
  // FormGather,
  Checkbox,
  // CheckboxGroup,
  // Radio,
  // RadioGroup,
  // RadioButton,
  Switch,
  Input,
  Select,
  // Optgroup,
  // Option,
  // Textarea,
  Button,
  // Modal,
  // List,
  // Pulldown,

  // 表格
  Table,
} from 'vxe-table'

export default function useTable(app: App) {
  // 表格功能
  app
    // .use(Footer)
    .use(Icon)
    .use(Filter)
    .use(Edit)
    // .use(Menu)
    // .use(Export)
    .use(Keyboard)
    .use(Validator)

    // 可选组件
    .use(Column)
    // .use(Colgroup)
    .use(Grid)
    .use(Tooltip)
    .use(Toolbar)
    .use(Pager)
    // .use(Form)
    // .use(FormItem)
    // .use(FormGather)
    .use(Checkbox)
    // .use(CheckboxGroup)
    // .use(Radio)
    // .use(RadioGroup)
    // .use(RadioButton)
    .use(Switch)
    .use(Input)
    .use(Select)
    // .use(Optgroup)
    // .use(Option)
    // .use(Textarea)
    .use(Button)
    // .use(Modal)
    // .use(List)
    // .use(Pulldown)

    // 安装表格
    .use(Table)

  // 给 vue 实例挂载内部对象，例如：
  // app.config.globalProperties.$XModal = VXETable.modal
  // app.config.globalProperties.$XPrint = VXETable.print
  // app.config.globalProperties.$XSaveFile = VXETable.saveFile
  // app.config.globalProperties.$XReadFile = VXETable.readFile

  VXETable.setup({
    zIndex: 9999, // 层级
  })
}
