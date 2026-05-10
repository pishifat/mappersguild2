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
                    :class="roleIs === role ? 'sorted' : 'unsorted'"
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
    name: 'TeamPageFilters',
    components: {
        FilterBox,
    },
    props: {
        storeModule: {
            type: String,
            required: true,
        },
        roleOptions: {
            type: Object,
            required: true,
        },
    },
    computed: {
        roleIs() {
            return this.$store.state[this.storeModule].roleIs;
        },
    },
    methods: {
        updateFilterValue(value: string): void {
            this.$store.dispatch(`${this.storeModule}/updateFilterValue`, value);
        },
        updateRole(role: string): void {
            this.$store.dispatch(`${this.storeModule}/updateRole`, role);
        },
    },
});
</script>
