<script lang="ts" setup>
import { CurrentUserInfo, UpdateUserOne, ChangeUserPassword } from '@/http'
import { NButton, NForm, NFormItem, NInput, useDialog, useMessage, type FormInst, type FormItemInst, type FormItemRule, type FormRules, type UploadFileInfo } from 'naive-ui'
import { h, onMounted, ref } from 'vue'
import type { UserType } from './types'

const fileList = ref<UploadFileInfo[]>([])
const token = localStorage.getItem('token')
const user = ref<Partial<UserType>>({})
const userFormRef = ref<FormInst | null>()
const message = useMessage()
const dialog = useDialog()

const passwordData = ref<{ password?: string; reenteredPassword?: string; prePassword?: string }>({})
const passwordRef = ref<FormInst | null>()
const rPasswordFormItemRef = ref<FormItemInst | null>()
const passwordRules: FormRules = {
  prePassword: {},
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: ['input', 'blur'],
    },
  ],
  reenteredPassword: [
    {
      required: true,
      message: '请再次输入密码',
      trigger: ['input', 'blur'],
    },
    {
      validator: validatePasswordStartWith,
      message: '两次密码输入不一致',
      trigger: 'input',
    },
    {
      validator: validatePasswordSame,
      message: '两次密码输入不一致',
      trigger: ['blur', 'password-input'],
    },
  ],
}

const rules: FormRules = {
  userName: [{ required: true, message: '必填', trigger: ['input', 'blur'] }],
  nickName: { required: true, message: '必填', trigger: ['input', 'blur'] },
  email: {},
  phonenumber: {
    validator(rule: FormItemRule, value: string) {
      if (!/^\d*$/.test(value)) {
        return new Error('格式错误')
      } else if (value.length !== 11) {
        return new Error('请输入手机号')
      }
      return true
    },
    trigger: ['input', 'blur'],
  },
  sex: {},
  remark: {},
}

function validatePasswordStartWith(rule: FormItemRule, value: string): boolean {
  return !!passwordData.value.password && passwordData.value.password.startsWith(value) && passwordData.value.password.length >= value.length
}
function validatePasswordSame(rule: FormItemRule, value: string): boolean {
  return value === passwordData.value.password
}

function handlePasswordInput() {
  if (passwordData.value.reenteredPassword) {
    rPasswordFormItemRef.value?.validate({ trigger: 'password-input' })
  }
}

async function getUserInfo() {
  const { code, msg, data } = await CurrentUserInfo()
  user.value = data
  if (data.avatar && data.avatar !== '') {
    fileList.value.length = 0
    fileList.value.push({ id: data.userName, name: '用户头像', status: 'finished', url: data.avatar })
  }
}

function finish(options: { file: UploadFileInfo; event?: ProgressEvent }) {
  const result = JSON.parse((options.event?.currentTarget as XMLHttpRequest).response)
  if (result.data && result.data !== '') {
    user.value.avatar = result.data
  }
  return options.file
}

function removeImage(options: { file: UploadFileInfo; fileList: Array<UploadFileInfo> }) {
  if (user.value.avatar && user.value.avatar.length !== 0) {
    user.value.avatar = ''
  }
  return true
}

function submit() {
  if (userFormRef.value?.validate) {
    console.log(user.value)
    UpdateUserOne({
      nickName: user.value.nickName,
      avatar: user.value.avatar,
      email: user.value.email,
      phonenumber: user.value.phonenumber,
      sex: user.value.sex,
      remark: user.value.remark,
    }).then((res) => {
      if (res.code === 200) {
        message.success(res.msg)
        getUserInfo()
      }
    })
  }
}
function updatePassword() {
  dialog.success({
    showIcon: false,
    title: '修改密码',
    content: () =>
      h(
        NForm,
        { ref: passwordRef, model: passwordData.value, rules: passwordRules },
        {
          default: () => [
            h(
              NFormItem,
              { label: '原密码', path: 'prePassword' },
              {
                default: () =>
                  h(NInput, {
                    type: 'password',
                    value: passwordData.value.prePassword,
                    placeholder: '请输入原密码验证身份',
                    onUpdateValue: (val: string) => (passwordData.value.prePassword = val),
                  }),
              }
            ),
            h(
              NFormItem,
              { label: '新密码', path: 'password' },
              {
                default: () =>
                  h(NInput, {
                    type: 'password',
                    value: passwordData.value.password,
                    placeholder: '请输入新密码',
                    onUpdateValue(val: string) {
                      passwordData.value.password = val
                    },
                    onInput: handlePasswordInput,
                  }),
              }
            ),
            h(
              NFormItem,
              { ref: rPasswordFormItemRef, label: '确认新密码', path: 'reenteredPassword' },
              {
                default: () =>
                  h(NInput, {
                    type: 'password',
                    value: passwordData.value.reenteredPassword,
                    placeholder: '请再次输入新密码',
                    disabled: !passwordData.value.password,
                    onUpdateValue: (val: string) => (passwordData.value.reenteredPassword = val),
                  }),
              }
            ),
          ],
        }
      ),
    positiveText: '确定',
    negativeText: '取消',
    maskClosable: false,
    onMaskClick: () => {
      message.success('不能关闭')
    },
    onNegativeClick: () => {
      console.log('取消')
    },
    onPositiveClick: () => {
      passwordRef.value?.validate((errors) => {
        if (!errors) {
          ChangeUserPassword({ password: passwordData.value.prePassword, newPassword: passwordData.value.password }).then(({ code, msg }) => {
            if (code === 200) {
              message.success(msg)
            } else {
              message.error(msg)
            }
          })
        } else {
          console.log(errors)
          message.error('验证失败')
        }
      })
    },
  })
}

onMounted(() => {
  getUserInfo()
})
</script>

<template>
  <div>
    <n-form ref="userFormRef" :model="user" :rules="rules">
      <n-grid :cols="6" x-gap="22" item-responsive responsive="screen">
        <n-grid-item span="6">
          <n-form-item label="头像">
            <n-upload
              action="/api/upload/image"
              :headers="{ Authorization: `Bearer ${token}` }"
              :default-file-list="fileList"
              list-type="image-card"
              accept="image/*"
              :max="1"
              @finish="finish"
              @remove="removeImage"
            >
              点击上传
            </n-upload>
          </n-form-item>
        </n-grid-item>
        <n-grid-item span="6 s:3 m:2">
          <n-form-item label="用户名" path="userName">
            <n-input disabled v-model:value="user.userName" placeholder="请输入用户名" />
          </n-form-item>
        </n-grid-item>
        <n-grid-item span="6 s:3 m:2">
          <n-form-item label="用户昵称" path="nickName">
            <n-input v-model:value="user.nickName" placeholder="请输入用户昵称" />
          </n-form-item>
        </n-grid-item>
        <n-grid-item span="6 s:3 m:2">
          <n-form-item label="用户邮箱" path="email">
            <n-input v-model:value="user.email" placeholder="请输入用户邮箱" />
          </n-form-item>
        </n-grid-item>
        <n-grid-item span="6 s:3 m:2">
          <n-form-item label="用户手机号码" path="phonenumber">
            <n-input v-model:value="user.phonenumber" :maxlength="11" placeholder="请输入用户手机号码" />
          </n-form-item>
        </n-grid-item>
        <n-grid-item span="6 s:3 m:2">
          <n-form-item label="用户性别" path="sex">
            <n-select
              v-model:value="user.sex"
              placeholder="请输入用户性别"
              :options="[
                { label: '男', value: '0' },
                { label: '女', value: '1' },
                { label: '保密', value: '2' },
              ]"
            />
          </n-form-item>
        </n-grid-item>
        <n-grid-item span="6 s:6">
          <n-form-item label="用户备注" path="remark">
            <n-input v-model:value="user.remark" type="textarea" placeholder="请输入备注" />
          </n-form-item>
        </n-grid-item>
      </n-grid>
    </n-form>
    <n-space>
      <n-button @click="submit" type="success">修改</n-button>
      <n-button @click="updatePassword" type="info">修改密码</n-button>
    </n-space>
  </div>
</template>
