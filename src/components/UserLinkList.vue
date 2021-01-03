<template>
    <a
        v-for="(user, i) in users"
        :key="i"
        :href="'https://osu.ppy.sh/users/' + user.osuId"
        target="_blank"
    >
        {{ listUser(user.username, i, users.length) }}
    </a>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { User } from '@interfaces/user';

export default defineComponent({
    name: 'UserLink',
    props: {
        users: {
            type: Array as PropType<User[]>,
            required: true,
        },
    },
    methods: {
        listUser(username: string, i: number, length: number): string {
            return username + (i < length - 1 ? ', ' : '');
        },
    },
});
</script>
