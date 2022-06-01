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
        screenings: {
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
            const screening = this.screenings.find(s => s.screener.id == userId);

            if (!screening) {
                return 'No comment';
            } else {
                return screening.comment;
            }
        },
        findVote (userId: string): number {
            const screening = this.screenings.find(s => s.screener.id == userId);

            if (!screening) {
                return 0;
            } else {
                return screening.vote;
            }
        },
    },
});
</script>
