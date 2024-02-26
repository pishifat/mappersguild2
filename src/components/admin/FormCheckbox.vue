<template>
    <form-field-base :label="label">
        <div class="form-check">
            <input
                :id="id"
                class="form-check-input"
                type="checkbox"
                :checked="modelValue"
                @change="$emit('update:modelValue', $event.target.checked)"
            />
            <label class="form-check-label" :for="id">
                {{ info }}
            </label>
        </div>
    </form-field-base>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FormFieldBase from './FormFieldBase.vue';

export default defineComponent({
    name: 'FormCheckbox',
    components: { FormFieldBase },
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
        modelValue: Boolean,
    },
    emits: [
        'update:modelValue',
    ],
});
</script>
