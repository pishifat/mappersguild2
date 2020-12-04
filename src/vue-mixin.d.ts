import { ResponseError } from './mixins';

declare module 'vue/types/vue' {
    interface Vue {
        initialRequest<T>(url: string, event?): Promise<T | { error: string }>;
        executeGet<T>(url: string, event?, updateLoadingState?: boolean): Promise<T | { error: string }>;
        executePost<T>(path: string, data?: Record<string, unknown>, event?): Promise<T | { error: string }>;
        isError<T>(error: T | ResponseError): error is ResponseError;
        listUser(username: string, i: number, length: number): string;
    }
}
