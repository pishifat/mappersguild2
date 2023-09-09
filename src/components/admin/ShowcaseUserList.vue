<template>
    <div class="container card card-body py-1">
        <h5 class="mt-2">
            FA showcase users by mode
        </h5>
        <button class="btn btn-sm w-100 btn-outline-info mb-3" @click="findShowcaseUsers($event)">
            Load users
        </button>

        <div v-if="osuUsers.length && taikoUsers.length && catchUsers.length && maniaUsers.length" class="row">
            <div v-if="osuUsers.length" class="col-sm-3">
                osu!
                <copy-paste :distinct="'osu'">
                    <div v-for="user in osuUsers" :key="user.id">
                        <user-link
                            :user="user"
                        />
                    </div>
                </copy-paste>
            </div>
            <div v-if="taikoUsers.length" class="col-sm-3">
                osu!taiko
                <copy-paste :distinct="'taiko'">
                    <div v-for="user in taikoUsers" :key="user.id">
                        <user-link
                            :user="user"
                        />
                    </div>
                </copy-paste>
            </div>
            <div v-if="catchUsers.length" class="col-sm-3">
                osu!catch
                <copy-paste :distinct="'catch'">
                    <div v-for="user in catchUsers" :key="user.id">
                        <user-link
                            :user="user"
                        />
                    </div>
                </copy-paste>
            </div>
            <div v-if="maniaUsers.length" class="col-sm-3">
                osu!mania
                <copy-paste :distinct="'mania'">
                    <div v-for="user in maniaUsers" :key="user.id">
                        <user-link
                            :user="user"
                        />
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

            messages.push(`hello! you're receiving this message because you marked yourself as a "FA showcase mapper" in the mappers guild https://osu.ppy.sh/home/news/2022-07-25-mappers-guild-updates#how-to-participate`);
            messages.push(`if you'd like to map an upcoming featured artist song for an announcement in October-December, send me some of the genres you'd like to map!`);
            messages.push(`i'll link some upcoming artists in return`);
            messages.push(`thank you!! -pishifat`);

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

<style scoped>
.tiny-button {
    font-size: 8px;
    max-height: 10px;
    padding: 5px 10px;
}
</style>