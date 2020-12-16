<template>
    <form-field-base :label="label">
        <select
            class="form-control form-control-sm"
            @input="$emit('input', $event.target.value)"
        >
            <option value="" selected>
                {{ placeholder }}
            </option>
            <slot>
                <option
                    v-for="(option, i) in options"
                    :key="i"
                    :value="option"
                    :selected="option === value"
                >
                    {{ option }}
                </option>
            </slot>
        </select>
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
            default: '...',
        },
        value: {
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
});
</script>
