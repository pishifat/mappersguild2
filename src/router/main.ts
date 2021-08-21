import { createRouter, createWebHistory } from 'vue-router';
import Axios from 'axios';
import routes from './routes';
import { store } from '../store/main';
import { User } from '@interfaces/user';
import { ErrorResponse } from '@interfaces/api/shared';
import { isError } from '@store/http';

const router = createRouter({
    history: createWebHistory(),
    routes,
    linkActiveClass: 'active',
});

router.beforeEach(async (to, from, next) => {
    document.title = to.meta.title as string || `Mappers' Guild`;

    if (!store.state.initialized) {
        const { data } = await Axios.get<User | null | ErrorResponse>('/api/me');

        if (!isError(data)) store.commit('setInitialData', data);
    }

    next();
});

export default router;
