<template>
    <form-field-base
        :label="label"
        :description="description"
    >
        <input
            :value="value"
            :type="type"
            :placeholder="placeholder"
            class="form-control form-control-sm"
            autocomplete="off"
            @input="$emit('input', $event.target.value)"
        >
    </form-field-base>
</template>

<script lang="ts">
import Vue from 'vue';
import FormFieldBase from './FormFieldBase.vue';

export default Vue.extend({
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
        value: {
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
});
</script>
