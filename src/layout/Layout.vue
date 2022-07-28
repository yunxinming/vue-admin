<script setup lang="ts">
import { nextTick, onMounted, provide, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import { useMenuStore } from '@/stores/menu'
import { CurrentUserInfo } from '@/http'
import type { UserType } from '@/views/system/user/types'
import Table from '@/components/Table.vue'

const inverted = ref(false)
const isFullScreen = ref(false)
const left = ref('240px')
const siderBorder = ref(true)
const menuStore = useMenuStore()
const collapsed = ref<boolean>(false)
const route = useRoute()
const userInfo = ref<Partial<UserType>>({})
const layoutContentRef = ref()
const layoutMainHeight = ref(0)
let cacHeheight = 0

provide('height', layoutMainHeight)

function trigger(coll: boolean) {
  collapsed.value = coll
  if (coll) {
    left.value = '64px'
  } else {
    left.value = '240px'
  }
}

onMounted(() => {
  menuStore.getRouter()
  getCurrentUserInfo()
  nextTick(() => {
    layoutMainHeight.value = parseInt(getComputedStyle(layoutContentRef.value.$el).height)
    cacHeheight = layoutMainHeight.value
  })
})

async function getCurrentUserInfo() {
  const { data } = await CurrentUserInfo()
  userInfo.value = data
}

const fullScreen = () => {
  if (!isFullScreen.value) {
    document.documentElement.requestFullscreen().finally(() => {
      nextTick(() => {
        layoutMainHeight.value = document.body.offsetHeight + 80
      })
    })
    isFullScreen.value = true
  } else {
    layoutMainHeight.value = cacHeheight
    isFullScreen.value = false
    document.exitFullscreen()
  }
}
</script>

<template>
  <n-layout has-sider style="height: 100vh">
    <n-layout-sider @update:collapsed="trigger" show-trigger collapse-mode="width" :collapsed-width="64" :width="240" :native-scrollbar="false" :inverted="inverted" :bordered="siderBorder">
      <Sidebar :activation="(route.meta.menuid as string)" :expanded="(route.meta.menuParentId as string) || ''" :collapsed="collapsed" />
    </n-layout-sider>
    <n-layout position="absolute">
      <n-layout-header bordered>
        <Header :isFullScreen="isFullScreen" @onFullScreen="fullScreen" :breadcrumbs="(route.meta.breadcrumb as string[])" :avatar="userInfo.avatar" />
      </n-layout-header>
      <n-layout-content ref="layoutContentRef" content-style="padding: 10px;" :native-scrollbar="false" position="absolute">
        <Table />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style lang="scss" scoped>
.n-layout {
  .n-layout {
    display: flex;
    flex-direction: column;
    left: v-bind('left');
    transition: all var(--n-bezier) 0.2s;

    .n-layout-header {
      height: 60px;
      padding: 10px;
      display: flex;
      align-items: center;
    }

    .n-layout-content {
      flex: 1;
      top: 60px;
      left: 0;
    }
  }
}
</style>
