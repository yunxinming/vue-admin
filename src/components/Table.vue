<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

interface tableInterfaceInfo {
  id: string
  title: string
  path: string
}
const value = ref('首页')
const panels = ref<tableInterfaceInfo[]>([{ id: '10', title: '首页', path: '/admin/home' }])
function handleClose(id: string) {
  const index = panels.value.findIndex((p) => p.id === id)
  if (index !== -1) {
    panels.value.splice(index, 1)
    if (route.meta.menuid === id) {
      handleClickTag(panels.value[index - 1].id)
    }
  }
}
const route = useRoute()
const router = useRouter()
onMounted(() => {
  nextTick(() => {
    autoAddTable(route.meta.breadcrumb as string[])
  })
})
watch(
  () => route.meta.breadcrumb as string[],
  (newData) => {
    autoAddTable(newData)
  }
)

function handleClickTag(id: string) {
  const index = panels.value.findIndex((p) => p.id === id)
  if (index !== -1) {
    router.push(panels.value[index].path)
  }
}

function autoAddTable(breadcrumb: string[]) {
  if (route.path === '/login') return
  const title = breadcrumb.length === 2 ? breadcrumb[1] : breadcrumb[0]
  value.value = title
  if (value.value !== '首页') {
    const index = panels.value.findIndex((p) => p.id === (route.meta.menuid as string))
    if (index === -1) {
      panels.value.push({ id: route.meta.menuid as string, title, path: route.path })
    }
  }
}
</script>

<template>
  <div class="space">
    <n-space inline>
      <n-tag
        class="tags"
        :bordered="false"
        :type="panel.id === route.meta.menuid as string ? 'success' : 'default'"
        v-for="panel in panels"
        :key="panel.id"
        :closable="panel.id !== '10'"
        @close.stop="handleClose(panel.id)"
        @click.stop="handleClickTag(panel.id)"
      >
        {{ panel.title }}</n-tag
      >
    </n-space>
  </div>
  <n-divider />
  <router-view v-slot="{ Component }">
    <transition name="fade-transform" mode="out-in">
      <keep-alive include="sys_home,sys_user,sys_role,sys_menu">
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<style lang="scss" scoped>
.space {
  padding: 0 0 10px 0;
}
.n-divider {
  margin: 0;
}
.tags {
  cursor: pointer;
}
</style>
