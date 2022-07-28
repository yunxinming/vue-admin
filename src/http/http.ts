import Axios from 'axios'

import { computed, ref } from 'vue'
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui'

const themeRef = ref<'light' | 'dark'>('light')
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
  theme: themeRef.value === 'light' ? lightTheme : darkTheme,
}))

const { message, loadingBar } = createDiscreteApi(['message', 'dialog', 'notification', 'loadingBar'], {
  configProviderProps: configProviderPropsRef,
})

export const Instance = Axios.create({
  baseURL: '/api',
})

Instance.interceptors.request.use((request) => {
  loadingBar.start()
  const token = window.localStorage.getItem('token')
  if (token && token !== '') {
    request.headers = {
      Authorization: `Bearer ${token}`,
    }
  }
  return request
})

Instance.interceptors.response.use((response) => {
  if (response.data.code === 401) {
    loadingBar.error()
    message.error('权限不足')
  }
  loadingBar.finish()
  return response.data
})

interface Ajax<T> {
  code: number
  msg: string
  data: T
}

export const GET = <T extends any, S extends any>(url: string) => {
  return (params?: T): Promise<Ajax<S>> => {
    return Instance({
      url,
      method: 'GET',
      params,
    }) as unknown as Promise<Ajax<S>>
  }
}

export const POST = <T extends any, U extends any>(url: string) => {
  return (data: T): Promise<Ajax<U>> => {
    return Instance({
      url,
      method: 'POST',
      data,
    }) as unknown as Promise<Ajax<U>>
  }
}

export const DEL = <T extends any, U extends any>(url: string) => {
  return (data: T): Promise<Ajax<U>> => {
    return Instance({
      url,
      method: 'DELETE',
      data,
    }) as unknown as Promise<Ajax<U>>
  }
}

export const PUT = <T extends any, U extends any>(url: string) => {
  return (data: T): Promise<Ajax<U>> => {
    return Instance({
      url,
      method: 'PUT',
      data,
    }) as unknown as Promise<Ajax<U>>
  }
}
