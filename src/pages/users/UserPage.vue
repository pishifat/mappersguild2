<template>
    <div>
        <user-page-filters />

        <div class="container bg-container py-3">
            <button
                :disabled="pagination.page == 1"
                class="btn btn-sm btn-mg mx-auto my-2"
                style="display:block"
                type="button"
                @click="showNewer"
            >
                <i class="fas fa-angle-up mr-1" /> show newer
                <i class="fas fa-angle-up ml-1" />
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
                    class="btn btn-sm btn-mg mx-auto my-2"
                    style="display:block"
                    type="button"
                    @click="showOlder"
                >
                    <i class="fas fa-angle-down mr-1" /> show older
                    <i class="fas fa-angle-down ml-1" />
                </button>
            </div>
        </div>

        <user-info />

        <toast-messages />

        <notifications-access v-if="userGroup != 'spectator'" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import UserCard from '@components/users/UserCard.vue';
import UserInfo from '@components/users/UserInfo.vue';
import ToastMessages from '@components/ToastMessages.vue';
import UserPageFilters from '@pages/users/UserPageFilters.vue';
import NotificationsAccess from '@components/NotificationsAccess.vue';

export default Vue.extend({
    name: 'UserPage',
    components: {
        UserCard,
        UserInfo,
        UserPageFilters,
        ToastMessages,
        NotificationsAccess,
    },
    computed: {
        ...mapState([
            'pagination',
            'userGroup',
        ]),
        ...mapGetters(['paginatedUsers']),
    },
    watch: {
        paginatedUsers (): void {
            this.$store.dispatch('updatePaginationMaxPages');
        },
    },
    async created () {
        const res: any = await this.executeGet('/users/relevantInfo');

        if (res) {
            this.$store.commit('setUsers', res.users);
            this.$store.commit('setUserId', res.userId);
            this.$store.commit('setUsername', res.username);
            this.$store.commit('setUserGroup', res.group);
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();

        // getting all bms is too heavy, so doing it later

        const res2: any = await this.executeGet('/users/beatmaps');

        if (res2) {
            this.$store.commit('setBeatmaps', res2.beatmaps);
        }
    },
    methods: {
        showOlder(): void {
            this.$store.commit('increasePaginationPage');
        },
        showNewer(): void {
            this.$store.commit('decreasePaginationPage');
        },
    },
});
</script>
