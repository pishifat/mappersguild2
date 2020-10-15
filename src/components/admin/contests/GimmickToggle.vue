<template>
    <div>
        <p class="text-white-50">
            {{ isTheme ? 'Theme' : 'Limitation' }}
            <button
                type="button"
                class="btn btn-sm btn-outline-info"
                @click="updateIsTheme($event)"
            >
                {{ isTheme ? 'Mark as Limitation' : 'Mark as Theme' }}
            </button>
        </p>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'GimmickToggle',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        isTheme: Boolean,
    },
    methods: {
        async updateIsTheme(e): Promise<void> {
            const isTheme = await this.executePost(`/admin/contests/${this.contestId}/updateIsTheme`, { isTheme: !this.isTheme }, e);

            if (!this.isError(isTheme)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated contest gimmick`,
                    type: 'info',
                });
                this.$store.commit('updateIsTheme', {
                    contestId: this.contestId,
                    isTheme,
                });
            }
        },
    },
});
</script>