<template>
    <div class="container bg-container py-3 mb-2">
        <filter-box
            placeholder="enter to search for username..."
        />

        <div class="row small mt-3">
            <div class="col-auto filter-title">
                Sort
            </div>

            <div class="col">
                <a
                    :class="sortBy === 'username' ? 'sorted' : 'unsorted'"
                    href="#"
                    @click.prevent="updateSorting('username')"
                >
                    Name
                </a>
                <a
                    :class="sortBy === 'rank' ? 'sorted' : 'unsorted'"
                    href="#"
                    @click.prevent="updateSorting('rank')"
                >
                    Rank
                </a>
                <a
                    :class="sortBy === 'createdAt' ? 'sorted' : 'unsorted'"
                    href="#"
                    @click.prevent="updateSorting('createdAt')"
                >
                    Joined
                </a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import FilterBox from '../../components/FilterBox.vue';
import { mapState, mapActions } from 'vuex';

export default Vue.extend({
    name: 'UserPageFilters',
    components: {
        FilterBox,
    },
    data () {
        return {
            sorted: false,
        };
    },
    computed: mapState([
        'sortBy',
    ]),
    methods: {
        ...mapActions([
            'updateSorting',
        ]),
    },
});
</script>
