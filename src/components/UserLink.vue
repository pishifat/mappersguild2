<template>
    <a
        :href="'https://osu.ppy.sh/users/' + user.osuId"
        target="_blank"
    >
        {{ user.username }}
    </a>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { User } from '@interfaces/user';

export default defineComponent({
    name: 'UserLink',
    props: {
        user: {
            type: Object as PropType<User>,
            required: true,
        },
    },
});
</script>
