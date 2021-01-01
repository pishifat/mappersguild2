<template>
    <div class="mb-3 row">
        <div class="col-sm-3 col-form-label">
            <b>{{ label }}</b>
        </div>
        <div class="col-sm-9">
            <slot />

            <p v-if="description" class="text-secondary small">
                {{ description }}
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
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
    },
});
</script>
