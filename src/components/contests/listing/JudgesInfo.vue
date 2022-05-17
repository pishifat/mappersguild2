<template>
    <div>
        <div class="input-group mb-2">
            <input
                v-model.number="judgeInput"
                class="form-control form-control-sm"
                autocomplete="off"
                placeholder="new judge username/osuId..."
                @keyup.enter="addJudge($event)"
            >
            <div class="input-group-append">
                <button
                    class="btn btn-primary"
                    href="#"
                    @click.prevent="addJudge($event)"
                >
                    <i class="fas fa-plus fa-xs" />
                </button>
            </div>
        </div>

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
            const judge = await this.$http.executePost(`/contests/listing/${this.contestId}/judges/add`, { judgeInput: this.judgeInput }, e);

            if (!this.$http.isError(judge)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Added ${this.judgeInput} to list (${this.judges.length + 1})`,
                    type: 'info',
                });
                this.$store.commit('addJudge', {
                    contestId: this.contestId,
                    judge,
                });
            }
        },
        async removeJudge(judgeId, e): Promise<void> {
            const res = await this.$http.executePost(`/contests/listing/${this.contestId}/judges/remove`, { judgeId }, e);

            if (!this.$http.isError(res)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Removed user from list`,
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