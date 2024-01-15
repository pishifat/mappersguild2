<template>
    <div>
        <user-page-filters />

        <div v-if="displayAs == 'cards'" class="container card card-body py-3">
            <button
                :disabled="pagination.page == 1"
                class="btn btn-sm btn-primary mx-auto my-2 d-block"
                type="button"
                @click="showNewer"
            >
                <i class="fas fa-angle-up me-1" /> show newer
                <i class="fas fa-angle-up ms-1" />
            </button>
            <div>
                <transition-group name="list" tag="div" class="row px-3">
                    <user-card
                        v-for="user in paginatedUsers"
                        :key="user.id"
                        :user="user"
                    />
                </transition-group>

                <div class="small text-center mx-auto">
                    {{ paginatedUsers.length === 0 ? '0' : pagination.page }} of {{ pagination.maxPages }}
                </div>

                <button
                    :disabled="pagination.page >= pagination.maxPages"
                    class="btn btn-sm btn-primary mx-auto my-2 d-block"
                    type="button"
                    @click="showOlder"
                >
                    <i class="fas fa-angle-down me-1" /> show older
                    <i class="fas fa-angle-down ms-1" />
                </button>
            </div>
        </div>

        <div v-else-if="displayAs == 'list'" class="container card card-body py-3">
            <transition-group name="list" tag="div" class="row px-3">
                <user-list-element
                    v-for="user in filteredUsers"
                    :key="user.id"
                    :user="user"
                />
            </transition-group>
        </div>

        <user-info />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapGetters, mapState } from 'vuex';
import UserCard from '@components/users/UserCard.vue';
import UserListElement from '@components/users/UserListElement.vue';
import UserInfo from '@components/users/UserInfo.vue';
import UserPageFilters from '@pages/users/UserPageFilters.vue';
import usersModule from '@store/users';
import { User } from '@interfaces/user';

export default defineComponent({
    name: 'UserPage',
    components: {
        UserCard,
        UserInfo,
        UserPageFilters,
        UserListElement,
    },
    computed: {
        ...mapState('users', [
            'pagination',
            'displayAs',
        ]),
        ...mapGetters('users', [
            'paginatedUsers',
            'allUsers',
            'filteredUsers',
        ]),
    },
    watch: {
        paginatedUsers (): void {
            this.$store.dispatch('users/updatePaginationMaxPages');
        },
    },
    beforeCreate () {
        if (!this.$store.hasModule('users')) {
            this.$store.registerModule('users', usersModule);
        }
    },
    async created () {
        const res = await this.$http.initialRequest<{ users: User[] }>('/users/query');

        if (!this.$http.isError(res)) {
            this.$store.commit('users/setUsers', res.users);
            const id = this.$route.query.id;

            if (id) {
                const i = this.allUsers.findIndex(u => u.id == id);

                if (i >= 0) {
                    this.$store.commit('users/setSelectedUserId', id);
                    this.$bs.showModal('extendedInfo');
                }
            }
        }
    },
    methods: {
        showOlder(): void {
            this.$store.commit('users/increasePaginationPage');
        },
        showNewer(): void {
            this.$store.commit('users/decreasePaginationPage');
        },
    },
});
</script>
