// import { ComponentCustomProperties } from 'vue';
import { Store } from 'vuex';
import { MainState } from '@store/main';
import { ErrorResponse } from '@interfaces/api/shared';

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $http: {
            initialRequest<T>(url: string, event?): Promise<T | { error: string }>;
            executeGet<T>(url: string, event?, updateLoadingState?: boolean): Promise<T | { error: string }>;
            executePost<T>(path: string, data?: Record<string, any>, event?): Promise<T | { error: string }>;
            isError<T>(error: T | ErrorResponse): error is ErrorResponse;
        };

        $bs: {
            hideModal(id: string): void;
            showModal(id: string): void;
        };

        $store: Store<MainState>;

        listUser(username: string, i: number, length: number): string;
    }
}
