import 'bootstrap/js/dist/modal';
import 'bootstrap/js/dist/tooltip';
import 'bootstrap/js/dist/toast';
import 'bootstrap/js/dist/dropdown';
import 'bootstrap/js/dist/collapse';
import './sass/app.scss';
import { createApp } from 'vue';
import { store } from './store/main';
import Root from './App.vue';
import UserLink from './components/UserLink.vue';
import router from './router/main';
import { http } from '@store/http';
import { showModal, hideModal } from './helpers';
import { tooltip } from './directives';
import MarkdownIt from 'markdown-it';

const app = createApp(Root);

app.use(store);
app.use(router);
app.component('UserLink', UserLink);

function setImageStyle(md) {
    const defaultRender = md.renderer.rules.image || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };

    md.renderer.rules.image = function (tokens, idx, options, env, self) {
        tokens[idx].attrPush(['style', 'max-width: 350px; max-height: 350px; height: auto; width: auto;']);

        return defaultRender(tokens, idx, options, env, self);
    };
}

const md = new MarkdownIt();
md.use(setImageStyle);
app.config.globalProperties.$md = md;

app.config.globalProperties.$http = http;
app.config.globalProperties.$bs = {
    showModal,
    hideModal,
};

app.directive('bs-tooltip', tooltip);

app.mount('#app');
