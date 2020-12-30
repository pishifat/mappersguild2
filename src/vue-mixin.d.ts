import { ErrorResponse } from '@interfaces/api/shared';

declare module 'vue/types/vue' {
    interface Vue {
        initialRequest<T>(url: string, event?): Promise<T | { error: string }>;
        executeGet<T>(url: string, event?, updateLoadingState?: boolean): Promise<T | { error: string }>;
        executePost<T>(path: string, data?: Record<string, any>, event?): Promise<T | { error: string }>;
        isError<T>(error: T | ErrorResponse): error is ErrorResponse;
        listUser(username: string, i: number, length: number): string;

        // Used on quest page
        isOpen: boolean;
        isWip: boolean;
        isDone: boolean;
    }
}
