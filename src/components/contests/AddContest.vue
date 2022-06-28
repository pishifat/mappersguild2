<template>
    <div class="container card card-body py-3 mb-2">
        <input
            v-model.trim="contestName"
            class="form-control mb-2"
            type="text"
            placeholder="name"
        />

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

export default defineComponent({
    name: 'AddContest',
    data () {
        return {
            contestName: '',
        };
    },
    methods: {
        async addContest(e): Promise<void> {
            const contest: any = await this.$http.executePost(`/contests/listing/create`, { name: this.contestName }, e);

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