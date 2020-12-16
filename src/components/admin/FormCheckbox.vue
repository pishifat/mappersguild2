<template>
    <form-field-base :label="label">
        <div class="form-check">
            <input
                :id="id"
                class="form-check-input"
                type="checkbox"
                :checked="checked"
                @change="$emit('change', $event.target.checked)"
            >
            <label class="form-check-label" :for="id">
                {{ info }}
            </label>
        </div>
    </form-field-base>
</template>

<script lang="ts">
import Vue from 'vue';
import FormFieldBase from './FormFieldBase.vue';

export default Vue.extend({
    name: 'FormCheckbox',
    components: { FormFieldBase },
    model: {
        prop: 'checked',
        event: 'change',
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
        info: {
            type: String,
            default: '',
        },
        checked: Boolean,
    },
});
</script>
