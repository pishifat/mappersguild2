<template>
    <div>
        <div class="container card card-body py-1">
            <div class="row">
                <div class="col-sm">
                    <button class="btn btn-sm btn-info btn-block" @click="updateUserPoints($event)">
                        Update user points
                    </button>

                    <span v-if="calculatingPoints" class="ml-2 small text-white-50">calculating points...</span>

                    <data-table
                        v-slot="{ obj: user }"
                        :data="users"
                        :headers="['USERNAME', 'RANK', 'BADGE']"
                        :custom-data-target="'#editUser'"
                        @update:selected-id="selectedUserId = $event"
                    >
                        <td>
                            <a :href="'https://osu.ppy.sh/users/' + user.osuId" target="_blank">{{ user.username }}</a>
                        </td>
                        <td>
                            <i
                                v-if="user.rank > 0"
                                class="fas fa-crown"
                                :class="'text-rank-' + user.rank"
                                data-toggle="tooltip"
                                data-placement="top"
                                :title="`rank ${user.rank} user`"
                            />
                        </td>
                        <td :class="{ 'bg-open': user.rank != user.badge }">
                            <i
                                v-if="user.badge > 0"
                                class="fas fa-crown"
                                :class="'text-rank-' + user.rank"
                                data-toggle="tooltip"
                                data-placement="top"
                                :title="`rank ${user.rank} user`"
                            />
                        </td>
                    </data-table>
                </div>
            </div>
        </div>

        <user-info
            :user="selectedUser"
            @update-user="updateUser($event)"
        />

        <tiered-user-list />

        <discord-highlight-generator />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import UserInfo from '../../components/admin/UserInfo.vue';
import DataTable from '../../components/admin/DataTable.vue';
import TieredUserList from '../../components/admin/TieredUserList.vue';
import DiscordHighlightGenerator from '../../components/admin/DiscordHighlightGenerator.vue';
import { User } from '../../../interfaces/user';
import { mapState } from 'vuex';
import usersAdminModule from '@store/admin/users';

export default Vue.extend({
    components: {
        DataTable,
        UserInfo,
        TieredUserList,
        DiscordHighlightGenerator,
    },
    data () {
        return {
            selectedUserId: '',
            calculatingPoints: false,
        };
    },
    computed: {
        ...mapState({
            users: (state: any) => state.usersAdmin.users,
        }),
        selectedUser(): undefined | User {
            return this.users.find(u => u.id === this.selectedUserId);
        },
    },
    beforeCreate () {
        if (!this.$store.hasModule('usersAdmin')) {
            this.$store.registerModule('usersAdmin', usersAdminModule);
        }
    },
    destroyed() {
        if (this.$store.hasModule('usersAdmin')) {
            this.$store.unregisterModule('usersAdmin');
        }
    },
    async created() {
        const users = await this.initialRequest<User[]>('/admin/users/load');

        if (!this.isError(users)) {
            this.$store.commit('setUsers', users);
        }
    },
    methods: {
        updateUser(u): void {
            const i = this.users.findIndex(user => user.id == u.id);

            if (i !== -1) {
                Vue.set(this.users, i, u);
            }
        },
        async updateUserPoints(e): Promise<void> {
            this.calculatingPoints = true;
            const success = await this.executePost('/admin/users/updateAllUserPoints', {}, e);

            if (success) {
                this.calculatingPoints = false;
            }
        },
    },
});
</script>
