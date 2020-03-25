<template>
    <div class="p-3">
        <p>
            Creator:
            <span class="text-white-50">{{ creator.username == 'pishifat' ? 'NONE' : creator.username }}</span>
            <input
                v-model="creatorOsuId"
                class="form-control-sm"
                type="text"
                autocomplete="off"
                placeholder="creator osuId..."
            >
            <button
                type="button"
                class="btn btn-sm btn-outline-info"
                @click="updateCreator($event)"
            >
                Save
            </button>
        </p>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'DateInfo',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        submissionId: {
            type: String,
            required: true,
        },
        creator: {
            type: Object,
            required: true,
        },
    },
    data () {
        return {
            creatorOsuId: this.creator.osuId,
        };
    },
    methods: {
        async updateCreator(e): Promise<void> {
            const creator = await this.executePost(`/admin/contests/submissions/${this.submissionId}/updateCreator`, { osuId: this.creatorOsuId }, e);
            console.log(creator);

            if (!this.isError(creator)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated submission creator`,
                    type: 'info',
                });
                this.$store.commit('updateCreator', {
                    contestId: this.contestId,
                    submissionId: this.submissionId,
                    creator,
                });
            }
        },
    },
});
</script>

<style>

</style>