import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import router from './router';
import pinia from './store';
import i18n from './i18n';
import './styles/style.less';
import './styles/theme.less';
import App from './App.vue';
import client from '@zlt/zlt-admin-client';

client.initShellSystem();

const app = createApp(App);

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus);
app.use(router);
app.use(pinia);
app.use(i18n);

app.mount('#app');
