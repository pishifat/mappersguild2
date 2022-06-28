<template>
    <div>
        <h4>
            <a v-if="url" :href="url" target="_blank">{{ name }}</a>
            <span v-else>{{ name }}</span>
        </h4>
        hosted by
        <user-link :user="creator">
            {{ creator.username }}
        </user-link>
        <hr />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { User } from '@interfaces/user';

export default defineComponent({
    name: 'ContestHeader',
    props: {
        name: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            default: null,
        },
        creator: {
            type: Object as () => User,
            required: true,
        },
    },
});
</script>