<template>
    <div class="container card card-body py-1 mb-4">
        <button class="btn btn-sm w-100 btn-outline-info" @click="findShowcaseUsers($event)">
            Load FA showcase users
        </button>

        <div v-if="osuUsers.length">
            osu
            <copy-paste :distinct="'osu'">
                <div v-for="user in osuUsers" :key="user.id">
                    {{ user.username }}
                </div>
            </copy-paste>
            <p v-for="user in osuUsers" :key="user.osuId">
                <a :href="'https://osu.ppy.sh/community/chat?sendto=' + user.osuId" target="_blank">
                    <button class="btn btn-sm btn-outline-info">
                        {{ user.username }}
                    </button>
                </a>
            </p>
        </div>

        <div v-if="taikoUsers.length">
            taiko
            <copy-paste :distinct="'taiko'">
                <div v-for="user in taikoUsers" :key="user.id">
                    {{ user.username }}
                </div>
            </copy-paste>
            <p v-for="user in taikoUsers" :key="user.osuId">
                <a :href="'https://osu.ppy.sh/community/chat?sendto=' + user.osuId" target="_blank">
                    <button class="btn btn-sm btn-outline-info">
                        {{ user.username }}
                    </button>
                </a>
            </p>
        </div>

        <div v-if="catchUsers.length">
            catch
            <copy-paste :distinct="'catch'">
                <div v-for="user in catchUsers" :key="user.id">
                    {{ user.username }}
                </div>
            </copy-paste>
            <p v-for="user in catchUsers" :key="user.osuId">
                <a :href="'https://osu.ppy.sh/community/chat?sendto=' + user.osuId" target="_blank">
                    <button class="btn btn-sm btn-outline-info">
                        {{ user.username }}
                    </button>
                </a>
            </p>
        </div>

        <div v-if="maniaUsers.length">
            mania
            <copy-paste :distinct="'mania'">
                <div v-for="user in maniaUsers" :key="user.id">
                    {{ user.username }}
                </div>
            </copy-paste>
            <p v-for="user in maniaUsers" :key="user.osuId">
                <a :href="'https://osu.ppy.sh/community/chat?sendto=' + user.osuId" target="_blank">
                    <button class="btn btn-sm btn-outline-info">
                        {{ user.username }}
                    </button>
                </a>
            </p>
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
