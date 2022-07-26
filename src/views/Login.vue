<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { Login } from '@/http'
import { useRouter } from 'vue-router'
import {useMenuStore} from "@/stores/menu";

const message = useMessage()
const router = useRouter()
const menuStore = useMenuStore()

onMounted(() => {
  window.localStorage.clear()
})

const userLoginInfo = ref({
  userName: 'yun',
  password: 'admin',
})
const submitButtonLoginStatus = ref(false)
const loginRef = ref<FormInst | null>(null)
const rules = ref<FormRules>({
  userName: [
    {
      required: true,
      message: '请输入账号',
    },
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
    },
  ],
})

function handleLoginValidate(e: MouseEvent) {
  e.preventDefault()
  loginRef.value?.validate((errors) => {
    if (!errors) {
      submitButtonLoginStatus.value = true
      Login({ ...userLoginInfo.value }).then(({ code, msg, data }) => {
        if (code === 200) {
          window.localStorage.setItem('token', data)
          menuStore.getRouter()
          setTimeout(() => {
            submitButtonLoginStatus.value = false
            message.success(msg)
            router.replace('/admin')
          }, 1000)
        } else if (code === 4002 || code === 403) {
          window.localStorage.clear()
          message.error(msg)
          submitButtonLoginStatus.value = false
        }
      })
    }
  })
}
</script>

<template>
  <div class="login">
    <div class="login-form">
      <n-grid item-responsive responsive="screen">
        <n-grid-item span="24">
          <n-h1>登 录</n-h1>
        </n-grid-item>
        <n-grid-item span="24">
          <n-form ref="loginRef" size="large" :model="userLoginInfo" :rules="rules">
            <n-form-item label="账号" path="userName">
              <n-input v-model:value="userLoginInfo.userName" placeholder="请输入用户名" />
            </n-form-item>
            <n-form-item label="用户密码" path="password">
              <n-input type="password" v-model:value="userLoginInfo.password" placeholder="请输入用户密码" />
            </n-form-item>
          </n-form>
          <div class="submit">
            <n-button size="large" type="success" :loading="submitButtonLoginStatus" @click="handleLoginValidate">登 录</n-button>
          </div>
        </n-grid-item>
      </n-grid>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  .login-form {
    width: 300px;
    .submit {
      .n-button {
        width: 100%;
      }
    }
  }
}
</style>
