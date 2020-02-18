import Vue from 'vue';
import { ResponseError } from './mixins';

declare module 'vue/types/vue' {
    interface Vue {
        executeGet<T>(path: string, event?): Promise<T | { error: string }>;
        executePost<T>(path: string, data?: object, event?): Promise<T | { error: string }>;
        isError<T>(error: T | ResponseError): error is ResponseError;
        listUser(username: string, i: number, length: number): string;
    }
}
