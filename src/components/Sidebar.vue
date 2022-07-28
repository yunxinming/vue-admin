<script setup lang="ts">
import { useMenuStore } from '@/stores/menu'
import type { menuType } from '@/views/system/menu/types'
import { NIcon, type MenuOption } from 'naive-ui'
import { h, nextTick, onMounted, ref, toRaw, type Component } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  MonitorHeartFilled,
  CatchingPokemonTwotone,
  SupervisedUserCircleRound,
  AccountCircleRound,
  InsertLinkSharp,
  KeyboardArrowDownFilled,
  HomeRound,
  MapsHomeWorkRound,
  SettingsApplicationsSharp,
  PeopleSharp,
  AccountTreeSharp
} from '@vicons/material'
import useAddRouter from '@/hooks/useAddRouter'

const iconResult = {
  home: HomeRound,
  system: SettingsApplicationsSharp,
  monitor: MonitorHeartFilled,
  tool: CatchingPokemonTwotone,
  user: SupervisedUserCircleRound,
  peoples: PeopleSharp,
  'tree-table': AccountTreeSharp,
  tree: AccountCircleRound,
  post: AccountCircleRound,
  dict: AccountCircleRound,
  edit: AccountCircleRound,
  message: AccountCircleRound,
  log: AccountCircleRound,
  online: AccountCircleRound,
  job: AccountCircleRound,
  druid: AccountCircleRound,
  server: AccountCircleRound,
  redis: AccountCircleRound,
  'redis-list': AccountCircleRound,
  build: AccountCircleRound,
  code: AccountCircleRound,
  swagger: AccountCircleRound,
  form: AccountCircleRound,
  logininfor: AccountCircleRound,
}

const menuStore = useMenuStore()
const menuOptions = ref<MenuOption[]>()

const props = withDefaults(
  defineProps<{
    collapsed: boolean
    activation: string
    expanded: string
  }>(),
  {
    collapsed: false,
  }
)

const router = useRouter()

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}
function handleRouter(router: menuType[]) {
  return router.map((m) => {
    m.key = m.menuId?.toString()
    m.label = handleMenuLabel(m)
    m.icon = iconResult[m.icon as keyof typeof iconResult] ? renderIcon(iconResult[m.icon as keyof typeof iconResult]) : renderIcon(InsertLinkSharp)
    if (m.children?.length !== 0) {
      m.children && handleRouter(m.children)
    }
    return m
  }) as unknown as MenuOption[]
}

function handleMenuLabel(menu: menuType) {
  if (menu.path.startsWith('http')) {
    return () => h('a', { href: menu.path, target: '_blank', rel: 'noopenner noreferrer' }, menu.menuName)
  }
  if (!menu.children) {
    return () =>
      h(
        RouterLink,
        {
          style: { width: '100%', height: '100%', display: 'block' },
          to: {
            path: `/admin/${menuStore.router.find((m) => m.menuId === menu.parentId)?.path}/${menu.path}`,
          },
        },
        { default: () => menu.menuName }
      )
  }
  if (menu.component === '' || menu.children?.length !== 0) {
    return menu.menuName
  }
}

onMounted(() => {
  setTimeout(() => {
    nextTick(() => {
      menuOptions.value = handleRouter(toRaw(menuStore.router))
      menuOptions.value.unshift({
        key: '10',
        icon: renderIcon(MapsHomeWorkRound),
        label: () => h(RouterLink, { to: { name: 'admin' }, style: { width: '100%', height: '100%', display: 'block' } }, { default: () => '首页' }),
      })
      useAddRouter(router)
    })
  }, 100)
})

function expandIcon(option: MenuOption) {
  return h(NIcon, null, { default: () => h(KeyboardArrowDownFilled) })
}
</script>

<template>
  <n-menu :collapsed="props.collapsed" :collapsed-width="64" :value="props.activation" :default-value="props.activation"
    :default-expanded-keys="[props.expanded]" :collapsed-icon-size="22" :options="menuOptions" :indent="22"
    :icon-size="22" :expand-icon="expandIcon" />
</template>
