<template>
    <div>
        <div class="row mb-2">
            <div class="col">
                <div class="input-group">
                    <button
                        class="btn btn-primary"
                        href="#"
                        @click.prevent="$emit('update:filterValue', newFilterValue)"
                    >
                        <i class="fas fa-search" />
                    </button>
                    <input
                        class="form-control"
                        type="text"
                        maxlength="48"
                        :placeholder="placeholder"
                        autocomplete="off"
                        :value="filterValue"
                        @input="newFilterValue = $event.target.value"
                        @keyup.enter="$emit('update:filterValue', $event.target.value)"
                    />
                    <slot />
                </div>
            </div>
        </div>
        <div class="row small">
            <div class="col">
                <slot name="filters" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        placeholder: {
            type: String,
            required: true,
        },
        filterValue: {
            type: String,
            default: '',
        },
    },
    emits: [
        'update:filterValue',
    ],
    data () {
        return {
            newFilterValue: '',
        };
    },
});
</script>
