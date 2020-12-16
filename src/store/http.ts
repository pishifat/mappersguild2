import Axios from 'axios';
import { BasicError } from 'helpers/helpers';
import { store } from '../app';

async function executeRequest<T>(requestType, url, data, e, updateLoadingState): Promise<T | BasicError> {
    if (updateLoadingState) store.commit('updateLoadingState');
    if (e) e.target.disabled = true;

    $(`[data-toggle='tooltip']`).tooltip('hide');

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

        return res.data;
    } catch (error) {
        store.dispatch('updateToastMessages', { message: 'Something went wrong!' });

        return { error: 'Something went wrong' };
    } finally {
        if (e) e.target.disabled = false;
        if (updateLoadingState) store.commit('updateLoadingState');
    }
}

export function isError<T>(error: T | BasicError): error is BasicError {
    return (error as BasicError).error !== undefined;
}

export const http = {
    async executePost<T>(url, data, e?): Promise<T | BasicError> {
        return await executeRequest('post', url, data, e, false);
    },

    async executeGet<T>(url, e?, updateLoadingState?): Promise<T | BasicError> {
        return await executeRequest('get', url, null, e, updateLoadingState);
    },

    async initialRequest<T>(url): Promise<T | BasicError> {
        return await executeRequest('get', url, null, null, true);
    },
};
