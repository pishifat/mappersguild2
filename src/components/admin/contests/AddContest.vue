<template>
    <div class="container bg-container py-3 mb-2">
        <input
            v-model.trim="contestName"
            class="form-control mb-2"
            type="text"
            placeholder="name"
        >

        <button
            class="btn btn-block btn-info"
            type="button"
            @click="addContest($event)"
        >
            Add new contest
        </button>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'AddContest',
    data () {
        return {
            contestName: '',
        };
    },
    methods: {
        async addContest(e): Promise<void> {
            const contest = await this.executePost(`/admin/contests/create`, { name: this.contestName }, e);

            if (!this.isError(contest)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Contest created`,
                    type: 'info',
                });
                this.$store.commit('addContest', contest);
            }
        },
    },
});
</script>