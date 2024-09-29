<template>
    <div class="container card card-body">
        <h4>
            Load users
        </h4>
        <h5 class="mt-2">
            Single user
        </h5>
        <input
            v-model="userInput"
            class="form-control form-control-sm mb-2"
            type="text"
            maxlength="18"
            autocomplete="off"
            placeholder="enter to search..."
            @keyup.enter="searchUser($event)"
        />
        <button class="btn btn-sm w-100 btn-info mb-2" @click="searchUser($event)">
            Load user
        </button>

        <h5 class="mt-2">
            All users
        </h5>
        <button class="btn btn-sm w-100 btn-info" @click="loadAllUsers($event)">
            Load all users
        </button>

        <div v-if="users && users.length">
            <admin-user-table
                :grouped-users="adminUsers"
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
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import AdminUserTable from './AdminUserTable.vue';
import { User } from '../../../interfaces/user';
import usersAdminModule from '@store/admin/users';

export default defineComponent({
    name: 'LoadUsers',
    components: {
        AdminUserTable,
    },
    data () {
        return {
            selectedUserId: '',
            userInput: '',
        };
    },
    computed: {
        ...mapState({
            users: (state: any) => state.usersAdmin.users,
        }),
        ...mapGetters([
            'normalUsers',
            'showcaseUsers',
            'adminUsers',
        ]),
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
        async loadAllUsers(e) {
            const users = await this.$http.executeGet<User[]>('/admin/users/load', e);

            if (!this.$http.isError(users)) {
                this.$store.commit('setUsers', users);
            }
        },
        async searchUser(e) {
            const user = await this.$http.executeGet<User[]>(`/admin/users/searchUser/${this.userInput}`, e);

            if (!this.$http.isError(user)) {
                this.$store.commit('setUsers', [user]);
            }
        },
    },
});
</script>
