<template>
    <copy-paste class="tiny">
        Comma separation: <br>
        <span v-for="(user, i) in users" :key="user.id">
            [{{ user.username }}](https://osu.ppy.sh/users/{{ user.osuId }}){{ i === users.length - 2 ? ', and ' : i === users.length - 1 ? '' : ', ' }}
        </span>
        <br><br>
        Newline separation: <br>
        <span v-for="user in users" :key="user.id">
            [{{ user.username }}](https://osu.ppy.sh/users/{{ user.osuId }})<br>
        </span>
    </copy-paste>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { User } from '@interfaces/user';
import CopyPaste from '../../CopyPaste.vue';

export default defineComponent({
    name: 'MarkdownUserList',
    components: {
        CopyPaste,
    },
    props: {
        users: {
            type: Array as PropType<User[]>,
            default: () => [],
        },
    },
});
</script>

<style scoped>
.tiny {
    font-size: 6pt;
}
</style>
