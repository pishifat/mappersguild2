<template>
    <div v-cloak>
        <div class="container bg-container py-1">
            <div class="row">
                <div class="col-sm">
                    <button class="btn btn-sm btn-info btn-block" @click="updateUserPoints($event)">
                        Update user points
                    </button>

                    <span v-if="calculatingPoints" class="ml-2 small text-white-50">calculating points...</span>

                    <data-table
                        #default="{ obj: user }"
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
                                :class="user.rank == 1 ? 'text-rank-1' : user.rank == 2 ? 'text-rank-2' : 'text-rank-3'"
                                data-toggle="tooltip"
                                data-placement="top"
                                :title="user.rank == 1 ? 'rank 1 user' : user.rank == 2 ? 'rank 2 user' : 'rank 3 user'"
                            />
                        </td>
                        <td :class="{ 'bg-open': user.rank != user.badge }">
                            <i
                                v-if="user.badge > 0"
                                class="fas fa-crown"
                                :class="user.badge == 1 ? 'text-rank-1' : user.badge == 2 ? 'text-rank-2' : 'text-rank-3'"
                                data-toggle="tooltip"
                                data-placement="top"
                                :title="user.badge == 1 ? 'rank 1 user' : user.badge == 2 ? 'rank 2 user' : 'rank 3 user'"
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

        <toast-messages />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import UserInfo from '../../components/admin/UserInfo.vue';
import DataTable from '../../components/admin/DataTable.vue';
import ToastMessages from '../../components/ToastMessages.vue';
import { User } from '../../../interfaces/user';
import { mapState } from 'vuex';

export default Vue.extend({
    components: {
        DataTable,
        UserInfo,
        ToastMessages,
    },
    data () {
        return {
            selectedUserId: '',
            calculatingPoints: false,
        };
    },
    computed: {
        ...mapState(['users']),
        selectedUser(): undefined | User {
            return this.users.find(u => u.id === this.selectedUserId);
        },
    },
    async created() {
        const users = await this.executeGet<User[]>('/admin/users/load');

        if (!this.isError(users)) {
            this.$store.commit('setUsers', users);
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();
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
