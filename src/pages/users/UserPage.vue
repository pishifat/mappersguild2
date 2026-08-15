<template>
    <div>
        <user-page-filters />

        <div class="container card card-body py-3">
            <transition-group name="list" tag="div" class="row px-3">
                <user-list-element
                    v-if="loggedInUser"
                    :key="loggedInUser.id"
                    :user="loggedInUser"
                />
                <div key="divisor" class="radial-divisor" />

                <template
                    v-for="item in usersListItems"
                    :key="item.type === 'user' ? item.user.id : item.type + '-' + item.rank"
                >
                    <div v-if="item.type === 'separator'" class="d-flex align-items-center my-2">
                        <hr class="flex-grow-1" />
                        <img
                            v-if="item.rank > 0"
                            :src="'/images/rank' + item.rank + '.png'"
                            class="rank-separator-badge mx-2"
                        />
                        <span v-else class="text-secondary fw-bold mx-2">{{ rankLabels[item.rank] }}</span>
                        <hr class="flex-grow-1" />
                    </div>
                    <div v-else-if="item.type === 'loadMore'" class="text-center my-2 w-100">
                        <button
                            class="btn btn-sm btn-primary"
                            type="button"
                            @click="loadRank(item.rank, $event)"
                        >
                            <i class="fas fa-angle-down me-1" /> show all {{ rankTotals[item.rank] }} {{ rankLabels[item.rank] }} users <i class="fas fa-angle-down ms-1" />
                        </button>
                    </div>
                    <user-list-placeholder
                        v-else-if="item.type === 'placeholder'"
                        :rank="item.rank"
                    />
                    <user-list-element
                        v-else
                        :user="item.user"
                    />
                </template>
            </transition-group>
        </div>

        <user-info />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapGetters, mapState } from 'vuex';
import UserListElement from '@components/users/UserListElement.vue';
import UserListPlaceholder from '@components/users/UserListPlaceholder.vue';
import UserInfo from '@components/users/UserInfo.vue';
import UserPageFilters from '@pages/users/UserPageFilters.vue';
import usersModule from '@store/users';
import { User } from '@interfaces/user';

type UserListItem =
    | { type: 'user'; user: User }
    | { type: 'separator'; rank: number }
    | { type: 'loadMore'; rank: number }
    | { type: 'placeholder'; rank: number };

export default defineComponent({
    name: 'UserPage',
    components: {
        UserInfo,
        UserPageFilters,
        UserListElement,
        UserListPlaceholder,
    },
    data () {
        return {
            previewRanks: [0, 1, 2],
            previewLimit: 10,
            rankLabels: {
                0: 'unranked',
                1: 'bronze',
                2: 'silver',
                3: 'gold',
                4: 'platinum',
                5: 'unreal',
            } as Record<number, string>,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapState('users', [
            'sortBy',
            'rankTotals',
        ]),
        ...mapGetters('users', [
            'allUsers',
            'filteredUsers',
            'isRankLoaded',
        ]),
        usersListItems(): UserListItem[] {
            const items: UserListItem[] = [];
            const users = this.filteredUsers;

            if (this.sortBy !== 'rank') {
                for (const user of users) {
                    items.push({ type: 'user', user });
                }

                return items;
            }

            let lastRank: number | null = null;

            for (let i = 0; i < users.length; i++) {
                const user = users[i];

                if (user.rank !== lastRank) {
                    items.push({ type: 'separator', rank: user.rank });
                    lastRank = user.rank;
                }

                items.push({ type: 'user', user });

                const nextUser = users[i + 1];
                const isEndOfGroup = !nextUser || nextUser.rank !== user.rank;

                if (isEndOfGroup && this.previewRanks.includes(user.rank) && !this.isRankLoaded(user.rank)) {
                    items.push({ type: 'placeholder', rank: user.rank });
                    items.push({ type: 'loadMore', rank: user.rank });
                }
            }

            return items;
        },
    },
    beforeCreate () {
        if (!this.$store.hasModule('users')) {
            this.$store.registerModule('users', usersModule);
        }
    },
    async created () {
        const res = await this.$http.initialRequest<{ users: User[] }>('/users/queryRanked');

        if (!this.$http.isError(res)) {
            this.$store.commit('users/setUsers', res.users);

            const id = this.$route.query.id;

            if (id) {
                let i = this.allUsers.findIndex(u => u.id == id);

                if (i < 0) {
                    const specificUser = await this.$http.executeGet<User | null>(`/users/queryUser/${id}`);

                    if (!this.$http.isError(specificUser) && specificUser) {
                        this.$store.commit('users/addSpecificUser', specificUser);
                    }

                    i = this.allUsers.findIndex(u => u.id == id);
                }

                if (i >= 0) {
                    this.$store.commit('users/setSelectedUserId', id);
                    this.$bs.showModal('extendedInfo');
                }
            }

            const previewResults = await Promise.all(
                this.previewRanks.map(rank => this.$http.executeGet<{ users: User[]; total: number }>(`/users/queryByRank/${rank}?limit=${this.previewLimit}`))
            );

            for (let i = 0; i < previewResults.length; i++) {
                const previewRes = previewResults[i];

                if (!this.$http.isError(previewRes)) {
                    this.$store.commit('users/addUsers', previewRes.users);
                    this.$store.commit('users/setRankTotal', { rank: this.previewRanks[i], total: previewRes.total });
                }
            }
        }
    },
    methods: {
        async loadRank (rank: number, e): Promise<void> {
            if (rank === 0 && !confirm('Are you sure? This will take a while. You can search for a user by typing their username at the top of this page.')) {
                return;
            }

            const res = await this.$http.executeGet<{ users: User[] }>(`/users/queryByRank/${rank}`, e);

            if (!this.$http.isError(res)) {
                this.$store.commit('users/addUsers', res.users);
                this.$store.commit('users/markRankLoaded', rank);
            }
        },
    },
});
</script>

<style scoped>
.rank-separator-badge {
    max-width: 80px;
    max-height: 80px;
    object-fit: cover;
    border-radius: 5px;
}
</style>
