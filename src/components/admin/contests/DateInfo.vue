<template>
    <div>
        <p class="text-white-50">
            <span v-if="!showContestStartDateInput">
                {{ contestStart ? 'Started: ' + contestStart : 'No start date set' }}
            </span>
            <input
                v-else
                v-model="newContestStart"
                class="form-control form-control-sm date-input"
                type="text"
                autocomplete="off"
                placeholder="yyyy-mm-dd"
                @change="updateContestStart($event)"
            >
            <a href="#" class="ms-1" @click.prevent="showContestStartDateInput = !showContestStartDateInput">
                <i class="fas fa-edit" />
            </a>
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
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
            const contestStart = await this.$http.executePost(`/admin/contests/${this.contestId}/updateContestStart`, { date: this.newContestStart }, e);

            if (!this.$http.isError(contestStart)) {
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

<style scoped>

.date-input {
    width: 10%;
}

</style>