import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import i18n from './i18n' 



import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

const app = createApp(App)
app.config.devtools = true

app.use(createPinia())  
app.use(router)         
app.use(i18n)           

app.mount('#app')