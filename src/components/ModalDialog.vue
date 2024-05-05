<template>
    <div class="modal fade" tabindex="-1">
        <div class="modal-dialog modal-fullscreen-lg-down" :class="`modal-${modalSize}`">
            <div v-if="loaded" class="modal-content the-a-background">
                <div
                    class="modal-header"
                    :class="headerClass || 'bg-primary'"
                    :style="headerStyle || {}"
                >
                    <h5 class="modal-title">
                        <slot name="header">
                            {{ title }}
                        </slot>
                    </h5>

                    <button
                        type="button"
                        class="btn-close"
                        :class="headerStyle ? 'btn-close-white' : ''"
                        data-bs-dismiss="modal"
                    />
                </div>

                <div class="modal-body">
                    <slot />
                </div>

                <div v-if="$slots.footer" class="modal-footer">
                    <slot name="footer" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ModalDialog',
    props: {
        title: {
            type: String,
            default: '',
        },
        modalSize: {
            type: String,
            default: 'lg',
        },
        headerClass: {
            type: String,
            default: 'bg-primary',
        },
        headerStyle: {
            type: Object,
            default: null,
        },
        // You can pass this prop when using dynamic data that may not exist at the mounted time (requires explicit default slot)
        // ex: <modal-dialog :loaded="Boolean(user)"> <template #default>{{ user.username }}</template> </modal-dialog>
        loaded: {
            type: Boolean,
            default: true,
        },
    },
});
</script>

<style lang="scss">
.modal-header, .modal-body, .modal-footer {
    z-index: 1;
}

.modal-header {
    color: var(--bs-dark);

    a {
        color: var(--bs-dark);

        &:hover {
            color: var(--bs-gray-dark);
            font-weight: bold;
        }
    }
}

.the-a-background::before {
    content: '';
    background-image: url('/images/the_A.png');
    background-repeat: no-repeat;
    background-size: contain;
    width: 100%;
    height: 100%;
    opacity: 0.25;
    position: absolute;
}
</style>
