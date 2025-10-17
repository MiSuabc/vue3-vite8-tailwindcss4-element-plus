import { createApp } from 'vue'
import './style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import router from "@/router";
import {createPinia} from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'

const app = createApp(App)


const Pinia = createPinia();
Pinia.use(piniaPluginPersistedstate);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(Pinia).use(router).use(ElementPlus,{locale: zhCn}).mount('#app')

