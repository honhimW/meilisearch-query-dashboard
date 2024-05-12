import './assets/css/main.css';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueFeather from 'vue-feather'
import PageHeaderVue from './components/ui/PageHeader.vue'
import Icon from '@/components/ui/Icon.vue'

import App from './App.vue'
import router from './router'
import { MeiliSearch } from 'meilisearch'

const app = createApp(App)

app.component(VueFeather.name as string, VueFeather);
app.component('PageHeader', PageHeaderVue);
app.component('Icon', Icon);
app.use(createPinia())
app.use(router)

app.mount('#app')

declare global {
  interface Window { msClient: MeiliSearch }
}
