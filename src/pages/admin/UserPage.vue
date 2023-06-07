<template>
    <div>
        <div class="container card card-body">
            <h4 class="mt-2">
                Groups
            </h4>
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

        <showcase-user-list />
        <contest-helper-user-list />

        <discord-highlight-generator />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AdminUserTable from './AdminUserTable.vue';
import ShowcaseUserList from '../../components/admin/ShowcaseUserList.vue';
import ContestHelperUserList from '../../components/admin/ContestHelperUserList.vue';
import DiscordHighlightGenerator from '../../components/admin/DiscordHighlightGenerator.vue';
import { User, UserGroup } from '../../../interfaces/user';
import { mapState } from 'vuex';
import usersAdminModule from '@store/admin/users';

export default defineComponent({
    components: {
        AdminUserTable,
        ShowcaseUserList,
        ContestHelperUserList,
        DiscordHighlightGenerator,
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
    async created() {
        const users = await this.$http.initialRequest<User[]>('/admin/users/load');

        if (!this.$http.isError(users)) {
            this.$store.commit('setUsers', users);
        }
    },
});
</script>
