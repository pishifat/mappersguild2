<template>
    <div>
        <div class="container card card-body py-3">
            <h5>Backgrounds list</h5>
            <button class="btn btn-sm btn-info w-100" @click="loadBackgrounds($event)">
                Load all backgrounds
            </button>

            <data-table
                v-if="backgrounds.length"
                v-slot="{ obj: background }"
                class="mt-2"
                :data="backgrounds"
                :headers="['NAME', 'SUBMITTED BY', 'STATUS']"
                :custom-data-target="'#editBackground'"
                @update:selected-id="selectedBackgroundId = $event"
            >
                <td>{{ background.name }}</td>
                <td>
                    <user-link :user="background.user" />
                </td>
                <td>
                    <span v-if="background.denied" class="text-danger">denied</span>
                    <span v-else-if="!background.approved" class="text-secondary">pending</span>
                    <span v-else-if="background.hidden" class="text-warning">hidden</span>
                    <span v-else class="text-success">approved</span>
                </td>
            </data-table>
        </div>

        <background-info-admin
            :background="selectedBackground"
            @update-background="updateBackground($event)"
            @delete-background="removeBackground($event)"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import DataTable from '../../components/admin/DataTable.vue';
import BackgroundInfoAdmin from '../../components/admin/BackgroundInfoAdmin.vue';
import { Background } from '../../../interfaces/background';
import backgroundsAdminModule from '@store/admin/backgrounds';

export default defineComponent({
    components: {
        DataTable,
        BackgroundInfoAdmin,
    },
    data () {
        return {
            selectedBackgroundId: '',
        };
    },
    computed: {
        ...mapState({
            backgrounds: (state: any) => state.backgroundsAdmin.backgrounds,
        }),
        selectedBackground(): undefined | Background {
            return this.backgrounds.find(b => b.id === this.selectedBackgroundId);
        },
    },
    beforeCreate () {
        if (!this.$store.hasModule('backgroundsAdmin')) {
            this.$store.registerModule('backgroundsAdmin', backgroundsAdminModule);
        }
    },
    unmounted () {
        if (this.$store.hasModule('backgroundsAdmin')) {
            this.$store.unregisterModule('backgroundsAdmin');
        }
    },
    methods: {
        async loadBackgrounds(e): Promise<void> {
            const backgrounds = await this.$http.executeGet<Background[]>('/admin/backgrounds/loadAll', e);

            if (!this.$http.isError(backgrounds)) {
                this.$store.commit('setBackgrounds', backgrounds);
            }
        },
        updateBackground(b): void {
            this.$store.commit('updateBackground', b);
        },
        removeBackground(id: string): void {
            this.$store.commit('removeBackground', id);
        },
    },
});
</script>
