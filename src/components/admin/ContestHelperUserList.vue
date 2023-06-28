<template>
    <div class="container card card-body py-1 my-2">
        <button class="btn btn-sm w-100 btn-outline-info mb-3" @click="findContestHelperUsers($event)">
            Load contest helper users
        </button>

        <div v-if="osuUsers && taikoUsers && catchUsers && maniaUsers" class="row">
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

export default defineComponent({
    name: 'ShowcaseUserList',
    components: {
        CopyPaste,
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

            messages.push(`hello! you're receiving this message because you marked yourself as a "FA showcase mapper" in the mappers guild https://i.imgur.com/aJt9uL1.png`);
            messages.push(`if you'd like to map an upcoming featured artist for an announcement in October-December, send me some of the genres you'd like to map!`);
            messages.push(`thank you!! -pishifat`);

            return messages;
        },
    },
    methods: {
        async findContestHelperUsers(e): Promise<void> {
            const res: any = await this.$http.executeGet('/admin/users/findContestHelperUsers', e);

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
