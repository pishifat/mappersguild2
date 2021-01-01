import { store } from '../app';
import { executeRequest } from '../mixins';
import { ErrorResponse } from '@interfaces/api/shared';

export function isError<T>(error: T | ErrorResponse): error is ErrorResponse {
    if (!error) return false;

    return (error as ErrorResponse).error !== undefined;
}

export const http = {
    async executePost<T>(url, data, e?): Promise<T | ErrorResponse> {
        return await executeRequest('post', url, data, e, false, store);
    },

    async executeGet<T>(url, e?, updateLoadingState?): Promise<T | ErrorResponse> {
        return await executeRequest('get', url, null, e, updateLoadingState, store);
    },

    async initialRequest<T>(url): Promise<T | ErrorResponse> {
        return await executeRequest('get', url, null, null, true, store);
    },
};
