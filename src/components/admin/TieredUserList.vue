<template>
    <div class="container bg-container py-1 mb-4">
        <button class="btn btn-sm btn-block btn-outline-info" @click="findTieredUsers($event)">
            Load tiered users
        </button>
        <div v-if="tieredUsers.length">
            <div class="copy-paste">
                <span v-for="user in tieredUsers" :key="user.id">
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
            tieredUsers: [] as User[],
        };
    },
    methods: {
        async findTieredUsers(e): Promise<void> {
            const res: any = await this.executeGet('/admin/users/findTieredUsers', e);

            if (res && !res.error) {
                this.tieredUsers = res;
            }
        },
    },
});
</script>

<style>
</style>