import 'bootstrap/js/dist/modal';
import 'bootstrap/js/dist/tooltip';
import 'bootstrap/js/dist/toast';
import 'bootstrap/js/dist/dropdown';
import 'bootstrap/js/dist/collapse';
import './sass/app.scss';
import { createApp } from 'vue';
import { store } from './store/main';
import Root from './App.vue';
import mixins from './mixins';
import router from './router/main';
import { http } from '@store/http';
import { showModal, hideModal } from './helpers';

const app = createApp(Root);

app.use(store);
app.use(router);
app.mixin(mixins);

app.config.globalProperties.$http = http;
app.config.globalProperties.$bs = {
    showModal,
    hideModal,
};

app.mount('#app');
