<template>
    <form-field-base :label="label">
        <textarea
            :value="value"
            class="form-control form-control-sm"
            :rows="rows"
            :placeholder="placeholder"
            @input="$emit('input', $event.target.value)"
        />
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
            type: String,
            required: true,
        },
        rows: {
            type: Number,
            default: 3,
        },
    },
});
</script>
