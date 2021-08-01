<template>
    <div class="container card card-body py-1 mb-4">
        <button class="btn btn-sm w-100 btn-outline-info mb-3" @click="findShowcaseUsers($event)">
            Load FA showcase users
        </button>

        <bot-chat-message
            v-if="uniqueUsers.length"
            :messages="messages"
            :message-type="'showcase'"
            :mongo-id="''"
            :users="uniqueUsers"
        />

        <div v-if="osuUsers.length && taikoUsers.length && catchUsers.length && maniaUsers.length" class="row">
            <div v-if="osuUsers.length" class="col-sm-3">
                osu!
                <copy-paste :distinct="'osu'">
                    <div v-for="user in osuUsers" :key="user.id">
                        {{ user.username }}
                    </div>
                </copy-paste>
            </div>
            <div v-if="taikoUsers.length" class="col-sm-3">
                osu!taiko
                <copy-paste :distinct="'taiko'">
                    <div v-for="user in taikoUsers" :key="user.id">
                        {{ user.username }}
                    </div>
                </copy-paste>
            </div>
            <div v-if="catchUsers.length" class="col-sm-3">
                osu!catch
                <copy-paste :distinct="'catch'">
                    <div v-for="user in catchUsers" :key="user.id">
                        {{ user.username }}
                    </div>
                </copy-paste>
            </div>
            <div v-if="maniaUsers.length" class="col-sm-3">
                osu!mania
                <copy-paste :distinct="'mania'">
                    <div v-for="user in maniaUsers" :key="user.id">
                        {{ user.username }}
                    </div>
                </copy-paste>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { User } from '../../../interfaces/user';
import CopyPaste from '../CopyPaste.vue';
import BotChatMessage from './BotChatMessage.vue';

export default defineComponent({
    name: 'ShowcaseUserList',
    components: {
        CopyPaste,
        BotChatMessage,
    },
    data() {
        return {
            osuUsers: [] as User[],
            taikoUsers: [] as User[],
            catchUsers: [] as User[],
            maniaUsers: [] as User[],
        };
    },
    computed: {
        uniqueUsers(): User[] {
            const allUsers = this.osuUsers.concat(this.taikoUsers, this.catchUsers, this.maniaUsers);

            const uniqueUsers: User[] = [];

            for (const user of allUsers) {
                const exists = uniqueUsers.find(u => u.osuId == user.osuId);

                if (!exists) uniqueUsers.push(user);
            }

            return uniqueUsers;
        },
        messages(): string[] {
            const messages: string[] = [];

            messages.push('hello');
            messages.push('test');
            messages.push('goodbye');

            return messages;
        },
    },
    methods: {
        async findShowcaseUsers(e): Promise<void> {
            const res: any = await this.$http.executeGet('/admin/users/findShowcaseUsers', e);

            if (res && !res.error) {
                this.osuUsers = res.osuUsers;
                this.taikoUsers = res.taikoUsers;
                this.catchUsers = res.catchUsers;
                this.maniaUsers = res.maniaUsers;
            }
        },
    },
});
</script>
