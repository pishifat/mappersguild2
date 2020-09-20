<template>
    <div class="container bg-container py-1 mb-4">
        <button class="btn btn-sm btn-block btn-outline-info" @click="findTieredUsers($event)">
            Load tiered users
        </button>
        <div v-if="osuUsers.length">
            osu
            <div class="copy-paste">
                <span v-for="user in osuUsers" :key="user.id">
                    <samp class="small text-white-50">
                        {{ user.username }}
                    </samp><br>
                </span>
            </div>
        </div>
        <div v-if="taikoUsers.length">
            taiko
            <div class="copy-paste">
                <span v-for="user in taikoUsers" :key="user.id">
                    <samp class="small text-white-50">
                        {{ user.username }}
                    </samp><br>
                </span>
            </div>
        </div>
        <div v-if="catchUsers.length">
            catch
            <div class="copy-paste">
                <span v-for="user in catchUsers" :key="user.id">
                    <samp class="small text-white-50">
                        {{ user.username }}
                    </samp><br>
                </span>
            </div>
        </div>
        <div v-if="maniaUsers.length">
            mania
            <div class="copy-paste">
                <span v-for="user in maniaUsers" :key="user.id">
                    <samp class="small text-white-50">
                        {{ user.username }}
                    </samp><br>
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { User } from '../../../interfaces/user';

export default Vue.extend({
    name: 'TieredUserList',
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