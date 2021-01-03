<template>
    <form-field-base :label="label">
        <textarea
            :value="modelValue"
            class="form-control form-control-sm"
            :rows="rows"
            :placeholder="placeholder"
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
            type: String,
            required: true,
        },
        rows: {
            type: Number,
            default: 3,
        },
    },
    emits: [
        'update:modelValue',
    ],
});
</script>
