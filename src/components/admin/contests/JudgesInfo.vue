<template>
    <div>
        <p class="row">
            <input
                v-model.number="judgeInput"
                class="form-control form-control-sm w-50"
                autocomplete="off"
                placeholder="new judge's username/osuId..."
                @keyup.enter="addJudge($event)"
            >
        </p>

        <ul v-if="judges.length">
            <li
                v-for="judge in judges"
                :key="judge.id"
            >
                <user-link :user="judge" />

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
                    @click.prevent="removeJudge(judge.id, $event)"
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
import { defineComponent, PropType } from 'vue';
import { User } from '@interfaces/user';

export default defineComponent({
    name: 'JudgesInfo',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        judges: {
            type: Array as PropType<User[]>,
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
            const judge = await this.$http.executePost(`/admin/contests/${this.contestId}/judges/add`, { judgeInput: this.judgeInput }, e);

            if (!this.$http.isError(judge)) {
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
            const res = await this.$http.executePost(`/admin/contests/${this.contestId}/judges/remove`, { judgeId }, e);

            if (!this.$http.isError(res)) {
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