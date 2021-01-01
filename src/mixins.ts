import Vue from 'vue';
import Axios from 'axios';
import { isError } from '@store/http';
import { enableTooltips, hideModal, hideTooltip, showModal } from './helpers';

export async function executeRequest (requestType, url, data, e, updateLoadingState, store) {
    if (updateLoadingState) store.commit('updateLoadingState');

    if (e) {
        if (e.dataset.bsToggle === 'tooltip') hideTooltip(e);
        e.target.disabled = true;
    }

    try {
        let res;

        if (requestType == 'post') {
            res = await Axios.post(url, data);
        } else {
            res = await Axios.get(url);
        }

        if (res.data.error) {
            store.dispatch('updateToastMessages', { message: res.data.error });
        }

        enableTooltips();

        return res.data;
    } catch (error) {
        store.dispatch('updateToastMessages', { message: 'Something went wrong!' });

        return { error: 'Something went wrong' };
    } finally {
        if (e) e.target.disabled = false;
        if (updateLoadingState) store.commit('updateLoadingState');
    }
}

export default Vue.extend({
    methods: {
        async executePost(url, data, e) {
            return await executeRequest('post', url, data, e, false, this.$store);
        },

        async executeGet(url, e, updateLoadingState) {
            return await executeRequest('get', url, null, e, updateLoadingState, this.$store);
        },

        async initialRequest(url) {
            return await executeRequest('get', url, null, null, true, this.$store);
        },

        isError,

        listUser(username: string, i: number, length: number): string {
            return username + (i < length - 1 ? ', ' : '');
        },

        hideModal,
        showModal,
    },
});
