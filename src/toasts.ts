interface ToastMessage {
    message: string;
    type?: 'error' | 'success' | 'info';
}

const toastsModule = {
    namespace: false,
    state: {
        toastMessages: [] as ToastMessage[],
    },
    mutations: {
        addToastMessage (state, message: ToastMessage): void {
            state.toastMessages.push(message);
        },
        removeFirstToastMessage (state): void {
            state.toastMessages.splice(0, 1);
        },
    },
    actions: {
        updateToastMessages ({ commit }, message: ToastMessage): void {
            commit('addToastMessage', message);

            setTimeout(() => {
                commit('removeFirstToastMessage');
            }, 3500);
        },
    },
};

export default toastsModule;
