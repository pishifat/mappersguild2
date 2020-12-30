import Axios from 'axios';
import { store } from '../app';
import { ErrorResponse } from '@interfaces/api/shared';

async function executeRequest<T>(requestType, url, data, e, updateLoadingState): Promise<T | ErrorResponse> {
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

export function isError<T>(error: T | ErrorResponse): error is ErrorResponse {
    if (!error) return false;

    return (error as ErrorResponse).error !== undefined;
}

export const http = {
    async executePost<T>(url, data, e?): Promise<T | ErrorResponse> {
        return await executeRequest('post', url, data, e, false);
    },

    async executeGet<T>(url, e?, updateLoadingState?): Promise<T | ErrorResponse> {
        return await executeRequest('get', url, null, e, updateLoadingState);
    },

    async initialRequest<T>(url): Promise<T | ErrorResponse> {
        return await executeRequest('get', url, null, null, true);
    },
};
