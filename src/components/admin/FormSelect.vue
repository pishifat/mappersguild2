<template>
    <form-field-base :label="label">
        <select
            class="form-select form-select-sm"
            @input="$emit('update:modelValue', $event.target.value)"
        >
            <option value="" selected>
                {{ placeholder }}
            </option>
            <slot>
                <option
                    v-for="(option, i) in options"
                    :key="i"
                    :value="option"
                    :selected="option === modelValue"
                >
                    {{ option }}
                </option>
            </slot>
        </select>
    </form-field-base>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FormFieldBase from './FormFieldBase.vue';

export default defineComponent({
    name: 'FormField',
    components: { FormFieldBase },
    props: {
        label: {
            type: String,
            required: true,
        },
        placeholder: {
            type: String,
            default: '...',
        },
        modelValue: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            default: 'text',
        },
        options: {
            type: Array,
            default: () => [],
        },
    },
    emits: [
        'update:modelValue',
    ],
});
</script>
