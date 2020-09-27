<template>
    <div class="container bg-container py-1 mb-4">
        <button class="btn btn-sm btn-block btn-outline-info" @click="findTieredUsers($event)">
            Load tiered users
        </button>

        <div v-if="osuUsers.length">
            osu
            <copy-paste :distinct="'osu'">
                <div v-for="user in osuUsers" :key="user.id">
                    {{ user.username }}
                </div>
            </copy-paste>
        </div>

        <div v-if="taikoUsers.length">
            taiko
            <copy-paste :distinct="'taiko'">
                <div v-for="user in taikoUsers" :key="user.id">
                    {{ user.username }}
                </div>
            </copy-paste>
        </div>

        <div v-if="catchUsers.length">
            catch
            <copy-paste :distinct="'catch'">
                <div v-for="user in catchUsers" :key="user.id">
                    {{ user.username }}
                </div>
            </copy-paste>
        </div>

        <div v-if="maniaUsers.length">
            mania
            <copy-paste :distinct="'mania'">
                <div v-for="user in maniaUsers" :key="user.id">
                    {{ user.username }}
                </div>
            </copy-paste>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { User } from '../../../interfaces/user';
import CopyPaste from '../CopyPaste.vue';

export default Vue.extend({
    name: 'TieredUserList',
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
        async findTieredUsers(e): Promise<void> {
            const res: any = await this.executeGet('/admin/users/findTieredUsers', e);

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

<style>
</style>