<template>
    <div class="ms-4 small">
        <div v-for="user in screeners" :key="user.id">
            <user-link
                :user="user"
            />
            <i
                v-for="i in findVote(user.id)"
                :key="i"
                class="fa-star fas mx-1 text-warning small"
            />

            <div class="ms-4 small text-secondary">
                {{ findComment(user.id) }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Screening } from '@interfaces/contest/screening';
import { User } from '@interfaces/user';

export default defineComponent({
    name: 'ScreeningDetail',
    props: {
        evaluations: {
            type: Array as PropType<Screening[]>,
            required: true,
        },
        screeners: {
            type: Array as PropType<User[]>,
            default () {
                return [];
            },
        },
    },
    methods: {
        findComment (userId: string): string {
            const evaluation = this.evaluations.find(e => e.screener.id == userId);

            if (!evaluation) {
                return 'No comment';
            } else {
                return evaluation.comment;
            }
        },
        findVote (userId: string): number {
            const evaluation = this.evaluations.find(e => e.screener.id == userId);

            if (!evaluation) {
                return 0;
            } else {
                return evaluation.vote;
            }
        },
    },
});
</script>
