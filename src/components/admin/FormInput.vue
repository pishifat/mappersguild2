<template>
    <form-field-base
        :label="label"
        :description="description"
    >
        <input
            :value="modelValue"
            :type="type"
            :placeholder="placeholder"
            class="form-control form-control-sm"
            autocomplete="off"
            @input="$emit('update:modelValue', $event.target.value)"
        />
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
            default: '',
        },
        modelValue: {
            type: [String, Number],
            required: true,
        },
        type: {
            type: String,
            default: 'text',
        },
        description: {
            type: String,
            default: '',
        },
    },
    emits: [
        'update:modelValue',
    ],
});
</script>
