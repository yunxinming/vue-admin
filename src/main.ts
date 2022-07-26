import {createApp} from 'vue'
import {createPinia} from 'pinia'
import useTable from '@/hooks/useTable'
import 'vxe-table/lib/style.css'

import App from './App.vue'
import router from './router'
import usePerms from "@/hooks/usePerms";

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(useTable)

app.directive('perms', {
    mounted(el, binding) {
        const perms = usePerms()
        if (binding.arg != null) {
            (el as HTMLButtonElement).hidden = !perms.includes(binding.arg)
        } else if (binding.value && binding.value.length >= 2) {
            (el as HTMLButtonElement).hidden = !perms.some(p => (binding.value as string[]).includes(p))
        }
    }
})

app.mount('#app')
