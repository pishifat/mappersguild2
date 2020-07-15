<template>
    <div>
        <p class="text-white-50">
            <span v-if="!showContestStartDateInput">
                {{ contestStart ? 'Started: ' + contestStart : 'No start date set' }}
            </span>
            <input
                v-else
                v-model="newContestStart"
                class="form-control-sm date-input"
                type="text"
                autocomplete="off"
                placeholder="yyyy-mm-dd"
                @change="updateContestStart($event)"
            >
            <a href="#" @click.prevent="showContestStartDateInput = !showContestStartDateInput">
                <i class="fas fa-edit" />
            </a>
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
        contestStart: {
            type: String,
            default: null,
        },
    },
    data () {
        return {
            newContestStart: this.contestStart,
            showContestStartDateInput: false,
        };
    },
    methods: {
        async updateContestStart(e): Promise<void> {
            const contestStart = await this.executePost(`/admin/contests/${this.contestId}/updateContestStart`, { date: this.newContestStart }, e);

            if (!this.isError(contestStart)) {
                this.showContestStartDateInput = false;
                this.$store.dispatch('updateToastMessages', {
                    message: `updated contest start date`,
                    type: 'info',
                });
                this.$store.commit('updateContestStart', {
                    contestId: this.contestId,
                    contestStart,
                });
            }
        },
    },
});
</script>

<style>

.date-input {
    width: 10%;
}

</style>