<template>
    <div>
        <p>
            Add judge:
            <input
                v-model.number="judgeInput"
                class="form-control form-control-sm"
                autocomplete="off"
                placeholder="new judge's osuId..."
                @keyup.enter="addJudge($event)"
            >
        </p>

        <ul v-if="judges.length">
            <li
                v-for="judge in judges"
                :key="judge.id"
            >
                <a :href="'https://osu.ppy.sh/users/' + judge.osuId" target="_blank">
                    {{ judge.username }}
                </a>

                <a
                    v-if="confirmDelete != judge.id"
                    href="#"
                    class="text-danger"
                    @click.prevent="confirmDelete = judge.id"
                >
                    delete
                </a>
                <a
                    v-else
                    class="text-danger"
                    href="#"
                    @click.prevent="removeJudge(judge.id)"
                >
                    confirm
                </a>
            </li>
        </ul>

        <div v-else class="text-white-50 m-4">
            None...
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'JudgesInfo',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        judges: {
            type: Array,
            required: true,
        },
    },
    data () {
        return {
            judgeInput: null,
            confirmDelete: null,
        };
    },
    methods: {
        async addJudge(e): Promise<void> {
            const judge = await this.executePost(`/admin/contests/${this.contestId}/judges/add`, { judgeInput: this.judgeInput }, e);

            if (!this.isError(judge)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `added ${this.judgeInput} (${this.judges.length + 1})`,
                    type: 'info',
                });
                this.$store.commit('addJudge', {
                    contestId: this.contestId,
                    judge,
                });
            }
        },
        async removeJudge(judgeId, e): Promise<void> {
            const res = await this.executePost(`/admin/contests/${this.contestId}/judges/remove`, { judgeId }, e);

            if (!this.isError(res)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `deleted`,
                    type: 'info',
                });
                this.$store.commit('deleteJudge', {
                    contestId: this.contestId,
                    judgeId,
                });
            }
        },
    },
});
</script>