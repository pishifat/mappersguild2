<template>
    <div class="container card card-body py-1 mb-4">
        <textarea
            v-model="inputUsers"
            class="form-control form-control-sm mx-2 mt-2 w-100"
            type="text"
            autocomplete="off"
            placeholder="usernames separated by newlines..."
        />
        <button class="btn btn-sm btn-block btn-outline-info" @click="generateDiscordHighlights($event)">
            Generate Discord highlights
        </button>
        <div v-if="users.length">
            <copy-paste>
                {{ discordHighlights }}
            </copy-paste>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { User } from '../../../interfaces/user';
import CopyPaste from '../CopyPaste.vue';

export default Vue.extend({
    name: 'DiscordHighlightGenerator',
    components: {
        CopyPaste,
    },
    data() {
        return {
            inputUsers: '',
            users: [] as User[],
        };
    },
    computed: {
        discordHighlights (): string {
            let text = '';

            for (const user of this.users) {
                text += `<@${user.discordId}> `;
            }

            return text;
        },
    },
    methods: {
        async generateDiscordHighlights(e): Promise<void> {
            const res: any = await this.executePost('/admin/users/findInputUsers', { inputUsers: this.inputUsers }, e);

            if (res && !res.error) {
                this.users = res.users;
            }
        },
    },
});
</script>
