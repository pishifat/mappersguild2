<template>
    <div class="row mt-3">
        <form-select
            v-model="selectedArtist"
            label="Artist"
            placeholder="Any"
            :auto-columns="true"
            @change="$emit('update:filterArtist', selectedArtist)"
        >
            <option value="-" disabled>
                ---
            </option>
            <option value="none">
                No specific artist
            </option>
            <option value="user">
                User-submitted quests
            </option>
            <option value="-" disabled>
                ---
            </option>
            <option
                v-for="featuredArtist in featuredArtists"
                :key="featuredArtist.id"
                :value="featuredArtist.osuId"
            >
                {{ featuredArtist.label }}
            </option>
        </form-select>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FormSelect from '@components/admin/FormSelect.vue';
import { FeaturedArtist } from '@interfaces/featuredArtist';

export default defineComponent({
    name: 'ArtistFilters',
    components: {
        FormSelect,
    },
    props: {
        isLoading: Boolean,
        filterArtist: {
            type: String,
            default: '',
        },
    },
    emits: [
        'update:filterArtist',
    ],
    data () {
        return {
            featuredArtists: [] as FeaturedArtist[],
            selectedArtist: '',
        };
    },
    watch: {
        selectedArtist(): void {
            // reset skips
        },
    },
    async created () {
        const res: any = await this.$http.executeGet<FeaturedArtist[]>('/featuredArtists');

        if (res) {
            this.featuredArtists = res.sort((a, b) => {
                if (a.label.toLowerCase() > b.label.toLowerCase()) return 1;
                if (b.label.toLowerCase() > a.label.toLowerCase()) return -1;

                return 0;
            });
        }
    },
    methods: {
    },
});
</script>
