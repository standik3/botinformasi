import { createApp } from 'vue'
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* import specific icons */
import { faBars, faPaperPlane, faArrowLeft, faSearch, faPlus, faEnvelope, faLock, faUsers, faUser, faMessage, faUserGroup, faHouse, faCheck, faTimes} from '@fortawesome/free-solid-svg-icons'
import { faBots, faGoogle } from '@fortawesome/free-brands-svg-icons'
/* import vue table */
import Vue3EasyDataTable from 'vue3-easy-data-table'

import App from './App.vue'
import router from './router'

/* add icons to the library */
library.add(faBars, faPaperPlane, faArrowLeft, faSearch, faPlus, faEnvelope, faLock, faUsers, faUser, faMessage, faUserGroup, faHouse, faBots, faCheck, faTimes, faGoogle)

import './assets/css/index.css'
import './assets/vue3-easy-data-table/dist/style.css';

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.component('EasyDataTable', Vue3EasyDataTable)
app.use(router)
app.mount('#app')