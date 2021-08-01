<template>
    <div>
        <div class="container card card-body py-1">
            <div class="row">
                <div class="col-sm">
                    <button class="btn btn-sm btn-info w-100" @click="updateUserPoints($event)">
                        Update user points
                    </button>

                    <span v-if="calculatingPoints" class="ms-2 small text-white-50">calculating points...</span>

                    <data-table
                        v-slot="{ obj: user }"
                        :data="users"
                        :headers="['USERNAME', 'RANK', 'QUEUED BADGE', 'BADGE']"
                        :custom-data-target="'#editUser'"
                        @update:selected-id="selectedUserId = $event"
                    >
                        <td>
                            <user-link :user="user" />
                        </td>
                        <td>
                            <i
                                v-if="user.rank"
                                v-bs-tooltip="`rank ${user.rank} user`"
                                class="fas fa-crown"
                                :class="'text-rank-' + user.rank"
                            />
                        </td>
                        <td :class="{ 'bg-open': user.rank != user.queuedBadge }">
                            <i
                                v-if="user.queuedBadge"
                                v-bs-tooltip="`rank ${user.queuedBadge} user`"
                                class="fas fa-crown"
                                :class="'text-rank-' + user.queuedBadge"
                            />
                        </td>
                        <td :class="{ 'bg-open': user.rank != user.badge }">
                            <i
                                v-if="user.badge"
                                v-bs-tooltip="`rank ${user.badge} user`"
                                class="fas fa-crown"
                                :class="'text-rank-' + user.badge"
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

        <showcase-user-list />

        <discord-highlight-generator />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import UserInfo from '../../components/admin/UserInfo.vue';
import DataTable from '../../components/admin/DataTable.vue';
import ShowcaseUserList from '../../components/admin/ShowcaseUserList.vue';
import DiscordHighlightGenerator from '../../components/admin/DiscordHighlightGenerator.vue';
import { User } from '../../../interfaces/user';
import { mapState } from 'vuex';
import usersAdminModule from '@store/admin/users';

export default defineComponent({
    components: {
        DataTable,
        UserInfo,
        ShowcaseUserList,
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
    unmounted () {
        if (this.$store.hasModule('usersAdmin')) {
            this.$store.unregisterModule('usersAdmin');
        }
    },
    async created() {
        const users = await this.$http.initialRequest<User[]>('/admin/users/load');

        if (!this.$http.isError(users)) {
            this.$store.commit('setUsers', users);
        }
    },
    methods: {
        updateUser(u): void {
            const i = this.users.findIndex(user => user.id == u.id);

            if (i !== -1) {
                this.users[i] = u;
            }
        },
        async updateUserPoints(e): Promise<void> {
            this.calculatingPoints = true;
            const success = await this.$http.executePost('/admin/users/updateAllUserPoints', {}, e);

            if (success) {
                this.calculatingPoints = false;
            }
        },
    },
});
</script>
