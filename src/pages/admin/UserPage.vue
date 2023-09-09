<template>
    <div>
        <div class="container card card-body">
            <h4>
                All users by group
            </h4>
            <button class="btn btn-sm w-100 btn-outline-info" @click="loadUsers($event)">
                Load users
            </button>

            <div v-if="users.length">
                <admin-user-table
                    :grouped-users="admins"
                    :group="'admin'"
                />
                <admin-user-table
                    :grouped-users="showcaseUsers"
                    :group="'secret'"
                />
                <admin-user-table
                    :grouped-users="normalUsers"
                    :group="'user'"
                />
            </div>
        </div>

        <hr />

        <osu-api-user-search
            class="mb-2"
        />
        <add-restricted-user
            class="mb-2"
        />
        <hr />
        <showcase-user-list
            class="mb-2"
        />
        <contest-helper-user-list
            class="mb-2"
        />
        <discord-highlight-generator
            class="mb-2"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AdminUserTable from './AdminUserTable.vue';
import ShowcaseUserList from '../../components/admin/ShowcaseUserList.vue';
import ContestHelperUserList from '../../components/admin/ContestHelperUserList.vue';
import DiscordHighlightGenerator from '../../components/admin/DiscordHighlightGenerator.vue';
import OsuApiUserSearch from '../../components/admin/OsuApiUserSearch.vue';
import { User, UserGroup } from '../../../interfaces/user';
import { mapState } from 'vuex';
import usersAdminModule from '@store/admin/users';
import AddRestrictedUser from '@components/mentorship/AddRestrictedUser.vue';

export default defineComponent({
    components: {
        AdminUserTable,
        ShowcaseUserList,
        ContestHelperUserList,
        DiscordHighlightGenerator,
        OsuApiUserSearch,
        AddRestrictedUser,
    },
    data () {
        return {
            selectedUserId: '',
        };
    },
    computed: {
        ...mapState({
            users: (state: any) => state.usersAdmin.users,
        }),
        selectedUser(): undefined | User {
            return this.users.find(u => u.id === this.selectedUserId);
        },
        normalUsers(): User[] {
            return this.users.filter(u => u.group == UserGroup.User);
        },
        showcaseUsers(): User[] {
            return this.users.filter(u => u.group == UserGroup.Secret);
        },
        admins(): User[] {
            return this.users.filter(u => u.group == UserGroup.Admin);
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
    methods: {
        async loadUsers(e) {
            const users = await this.$http.executeGet<User[]>('/admin/users/load', e);

            if (!this.$http.isError(users)) {
                this.$store.commit('setUsers', users);
            }
        },
    },
});
</script>
