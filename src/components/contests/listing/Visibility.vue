<template>
    <button class="btn btn-sm btn-outline-danger w-100 mt-2" @click="toggleIsVisible($event)">
        Display contest on public listing
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Visibility',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        isVisible: {
            type: Boolean,
            required: true,
        },
    },
    methods: {
        async toggleIsVisible(e): Promise<void> {
            const result = confirm(`Are you sure? This cannot be undone.`);

            if (result) {
                const isVisible = await this.$http.executePost(`/contests/listing/${this.contestId}/toggleIsVisible`, {}, e);

                if (!this.$http.isError(isVisible)) {
                    this.$store.dispatch('updateToastMessages', {
                        message: `Updated contest visibility`,
                        type: 'info',
                    });
                    this.$store.commit('updateIsVisible', {
                        contestId: this.contestId,
                        isVisible,
                    });
                }
            }
        },
    },
});
</script>