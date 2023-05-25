<template>
    <div class="row" :class="autoColumns ? '' : 'mb-3'">
        <div
            :class="autoColumns ? 'col-auto filter-title' : 'col-sm-3'"
            class="col-form-label"
        >
            {{ label }}
        </div>
        <div :class="autoColumns ? 'col' : 'col-sm-9'">
            <slot />

            <p v-if="description" class="text-secondary small">
                {{ description }}
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'FormFieldBase',
    props: {
        label: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        autoColumns: {
            type: Boolean,
            default: false,
        },
    },
});
</script>
