<template>
    <div class="position-fixed bottom-0 w-100" style="z-index: 2000">
        <div class="position-relative">
            <div class="toast-container position-absolute bottom-0 start-50 translate-middle-x p-3">
                <div
                    v-for="(toast, i) in toastMessages"
                    :key="i"
                    class="toast show d-flex align-items-center"
                    :class="getToastTypeClass(toast)"
                    data-bs-autohide="true"
                >
                    <div class="toast-body">
                        {{ toast.message }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';

export default defineComponent({
    computed: {
        ...mapState({
            toastMessages: (state: any) => state.toasts.toastMessages,
        }),
    },
    methods: {
        getToastTypeClass(toast): string {
            if (toast.type === 'success') return 'bg-success';
            if (toast.type === 'info') return 'bg-info';

            return 'bg-danger';
        },
    },
});
</script>

<style>
.toast {
    -webkit-animation: fadeOutAnimation 0.5s ease-in 3s forwards;
    -moz-animation: fadeOutAnimation 0.5s ease-in 3s forwards;
    -o-animation: fadeOutAnimation 0.5s ease-in 3s forwards;
    animation: fadeOutAnimation 0.5s ease-in 3s forwards;
    -webkit-animation-fill-mode: forwards;
    animation-fill-mode: forwards;
}

@keyframes fadeOutAnimation {
    from {
        display: block;
        opacity: 1;
    }
    to {
        display: none;
        opacity: 0;
    }
}
@-webkit-keyframes fadeOutAnimation {
    from {
        display: block;
        opacity: 1;
    }
    to {
        display: none;
        opacity: 0;
    }
}
</style>