<template>
    <span>
        <a
            :href="userSubmission.url"
            target="_blank"
            class="small"
        >
            {{ userSubmission.url }}
        </a>
        <span class="small text-secondary ms-1">(last updated <code>{{ new Date(userSubmission.updatedAt).toString().slice(4,33) }}</code>)</span>
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapGetters } from 'vuex';

export default defineComponent({
    name: 'CurrentSubmission',
    computed: {
        ...mapGetters([
            'userSubmission',
        ]),
    },
});
</script>

<style scoped>
</style>