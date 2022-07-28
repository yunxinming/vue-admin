<script setup lang="ts">
import { onMounted } from 'vue'
import echarts, { option } from '@/hooks/useEcharts'

onMounted(() => {
  const home = echarts.init(document.getElementById('echart')!, {
    ResizeObserverSize: true,
  })
  home.setOption(option)
})
</script>

<template>
  <div class="home">
    <n-grid cols="4" item-responsive responsive="screen">
      <n-grid-item span="4 m:2">
        <n-descriptions label-placement="top" title="项目描述" style="padding-bottom: 10px">
          <n-descriptions-item>
            <n-p>这是一个前后端分离的后台管理系统</n-p>
            <n-p>使用了RESTful API规范，目前已完成用户管理、角色管理、菜单管理模块。</n-p>
            <n-p>前端技术栈 Vue3、TypeScript、Pinia、NaiveUI、Echarts、VxeTable</n-p>
            <n-p>后端技术栈 Spring Boot 2、Spring Security、MybatisPlus、Druid、jjwt</n-p>
            <n-p>
              <n-space>
                <n-a target="_blank" href="https://github.com/yunxinming/vue-admin">前端Github地址</n-a>
                <n-a target="_blank" href="https://github.com/yunxinming/vue-admin-backstage">后端Github地址</n-a>
              </n-space>
            </n-p>
          </n-descriptions-item>
        </n-descriptions>
      </n-grid-item>
      <n-grid-item span="4 m:2">
        <div id="echart"></div>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<style lang="scss" scoped>
.home {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  #echart {
    width: 500px;
    height: 300px;
  }
}
</style>
