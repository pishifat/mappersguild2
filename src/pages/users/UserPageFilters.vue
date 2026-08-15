<template>
    <div class="card card-body mb-2">
        <div class="container">
            <filter-box
                placeholder="enter to search for username..."
                :filter-value="filterValue"
                @update:filterValue="updateFilterValue($event)"
            >
                <template #filters>
                    <mode-filters
                        :filter-mode="filterMode"
                        @update:filterMode="updateFilterMode($event)"
                    />
                </template>
            </filter-box>

            <div class="row small mt-3">
                <div class="col-auto filter-title">
                    Sort
                </div>

                <div class="col">
                    <a
                        v-for="(sortText, sort) in sortOptions"
                        :key="sort"
                        :class="sortBy === sort ? 'sorted' : 'unsorted'"
                        href="#"
                        @click.prevent="updateSorting(sort)"
                    >
                        {{ sortText }}
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'vuex';
import FilterBox from '@components/FilterBox.vue';
import ModeFilters from '@components/ModeFilters.vue';
import { User } from '@interfaces/user';

export default defineComponent({
    name: 'UserPageFilters',
    components: {
        FilterBox,
        ModeFilters,
    },
    data () {
        return {
            sorted: false,
            sortOptions: {
                username: 'Name',
                rank: 'Points',
                createdAt: 'Joined',
            },
        };
    },
    computed: mapState('users', [
        'sortBy',
        'filterMode',
        'filterValue',
    ]),
    methods: {
        ...mapActions('users', [
            'updateSorting',
            'updateFilterMode',
        ]),
        async updateFilterValue (value: string): Promise<void> {
            const trimmedValue = value.trim();

            if (trimmedValue) {
                let match: User | undefined = this.$store.getters['users/findLocalUser'](trimmedValue);

                if (!match) {
                    const res = await this.$http.executeGet<{ user: User | null }>(`/users/searchUser/${encodeURIComponent(trimmedValue)}`);

                    if (!this.$http.isError(res) && res.user) {
                        this.$store.commit('users/addUsers', [res.user]);
                        match = res.user;
                    }
                }

                if (match) {
                    this.$store.commit('users/setSelectedUserId', match.id);
                    this.$bs.showModal('extendedInfo');

                    return;
                }
            }

            this.$store.dispatch('users/updateFilterValue', value);
        },
    },
});
</script>
