<template>
    <div class="container card card-body py-3 mb-2">
        <filter-box
            placeholder="search username..."
            @update:filterValue="updateFilterValue($event)"
        />
        <div class="row small mt-3">
            <div class="col-auto filter-title">
                Role
            </div>

            <div class="col">
                <a
                    v-for="(roleText, role) in roleOptions"
                    :key="role"
                    :class="roleIs === role || (roleIs == 'visual designer' && role == 'designer') ? 'sorted' : 'unsorted'"
                    href="#"
                    @click.prevent="updateRole(role)"
                >
                    {{ roleText }}
                </a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FilterBox from '@components/FilterBox.vue';
import { mapState, mapActions } from 'vuex';

export default defineComponent({
    name: 'LocusPageFilters',
    components: {
        FilterBox,
    },
    data () {
        return {
            roleOptions: {
                any: 'Any',
                designer: 'Visual designer',
                mapper: 'Mapper',
                musician: 'Musician',
            },
        };
    },
    computed: mapState('locus', [
        'roleIs',
    ]),
    methods: mapActions('locus', [
        'updateFilterValue',
        'updateRole',
    ]),
});
</script>
