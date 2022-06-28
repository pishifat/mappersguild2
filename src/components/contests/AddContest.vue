<template>
    <div class="container card card-body py-3 mb-2">
        <input
            v-model.trim="contestName"
            class="form-control mb-2"
            type="text"
            placeholder="name"
        />

        <select v-model="templateContest" class="form-select form-select-sm mb-2">
            <option value="" disabled>
                Contest details template
            </option>
            <option v-for="contest in userContests" :key="contest.id" :value="contest.id">
                {{ contest.name }}
            </option>
            <option v-if="!userContests.length" value="x" disabled>
                No templates available
            </option>
        </select>

        <button
            class="btn w-100 btn-info"
            type="button"
            @click="addContest($event)"
        >
            Add new contest
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Contest } from '@interfaces/contest/contest';

export default defineComponent({
    name: 'AddContest',
    data () {
        return {
            contestName: '',
            userContests: [] as Contest[],
            templateContest: '',
        };
    },
    async created () {
        const userContests: any = await this.$http.executeGet<Contest[]>(
            `/contests/listing/loadUserContests`
        );

        this.userContests = userContests;
    },
    methods: {
        async addContest(e): Promise<void> {
            const contest: any = await this.$http.executePost(`/contests/listing/create`, { name: this.contestName, templateId: this.templateContest }, e);

            if (!this.$http.isError(contest)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Contest created`,
                    type: 'info',
                });
                this.$store.commit('addContest', contest);
                this.$router.replace(`/contests/listing?contest=${contest.id}`);
            }
        },
    },
});
</script>