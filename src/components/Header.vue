<script lang="ts" setup>
import { AccountCircleRound, ZoomOutMapFilled, ZoomInMapFilled } from '@vicons/material'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Logout } from '@/http'
import {useMenuStore} from "@/stores/menu";

const props = defineProps<{ breadcrumbs: string[]; avatar?: string; isFullScreen: boolean }>()
const router = useRouter()
const menuStore = useMenuStore()
const options = [
  {
    label: '用户资料',
    key: 'system/user/edit',
  },
  {
    label: '退出登录',
    key: 'exit',
  },
]

function handleSelect(key: string) {
  if (key === 'exit') {
    Logout().then((res) => {
      if (res.code === 200) {
        menuStore.router = []
        router.replace({ name: 'login' })
      }
    })
    return
  }
  router.push('/admin/' + key)
}
</script>

<template>
  <header>
    <n-breadcrumb>
      <n-breadcrumb-item v-for="(title, index) in props.breadcrumbs" :key="index">{{ title }}</n-breadcrumb-item>
    </n-breadcrumb>
    <div class="right">
      <n-space>
        <div class="util" @click="$emit('onFullScreen')">
          <n-icon size="28" color="#666" v-show="!isFullScreen"> <ZoomOutMapFilled /> </n-icon>
          <n-icon size="28" color="#666" v-show="isFullScreen"> <ZoomInMapFilled /> </n-icon>
        </div>
        <div class="avatar">
          <n-dropdown :options="options" @select="handleSelect">
            <n-avatar round v-if="props.avatar === ''">
              <n-icon>
                <AccountCircleRound />
              </n-icon>
            </n-avatar>
            <n-avatar round :src="props.avatar" v-else></n-avatar>
          </n-dropdown>
        </div>
      </n-space>
    </div>
  </header>
</template>

<style lang="scss" scoped>
header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  .n-breadcrumb {
    display: flex;
    align-items: center;
  }
  .right {
    display: flex;
    align-items: center;
    .util {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    .avatar {
      display: flex;
      align-items: center;
    }
  }
}
</style>
