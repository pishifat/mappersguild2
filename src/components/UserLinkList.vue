<template>
    <template v-if="useGrammar">
        <span v-for="(user, i) in users" :key="i">
            <a
                :href="'https://osu.ppy.sh/users/' + user.osuId"
                target="_blank"
            >{{ user.username }}</a>{{ grammarSeparator(i, users.length) }}
        </span>
    </template>
    <template v-else>
        <a
            v-for="(user, i) in users"
            :key="i"
            :href="'https://osu.ppy.sh/users/' + user.osuId"
            target="_blank"
        >
            {{ listUser(user.username, i, users.length) }}
        </a>
    </template>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { User } from '@interfaces/user';

export default defineComponent({
    name: 'UserLinkList',
    props: {
        users: {
            type: Array as PropType<User[]>,
            required: true,
        },
        useGrammar: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        listUser(username: string, i: number, length: number): string {
            return username + (i < length - 1 ? ', ' : '');
        },
        grammarSeparator(i: number, length: number): string {
            if (i === length - 1) return '';
            if (i === length - 2) return length > 2 ? ', and ' : ' and ';

            return ', ';
        },
    },
});
</script>
