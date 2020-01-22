<template>
    <div class="container bg-container py-3 mb-2">
        <filter-box
            placeholder="song/username..."
        >
            <button
                class="btn btn-outline-info"
                href="#"
                data-toggle="modal"
                data-target="#addBeatmap"
                @click.prevent="openAddBeatmap()"
            >
                Add beatmap <i class="fas fa-plus small" />
            </button>
        </filter-box>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Axios from 'axios';
import { FeaturedSong } from '../../models/featuredSong';
import FilterBox from '../../components/FilterBox.vue';

export default Vue.extend({
    components: {
        FilterBox,
    },
    data () {
        return {
            featuredArtists: null,
            featuredSongs: null as null | FeaturedSong,
        };
    },
    methods: {
        openAddBeatmap (): void {
            this.info = '';
            this.featuredSongs = null;
            $('input[type=checkbox]').each(function() {
                (this as any).checked = false;
            });

            if (!this.featuredArtists) {
                Axios.get('/beatmaps/artists').then(response => {
                    this.featuredArtists = response.data.sort((a, b) => {
                        if (a.label.toLowerCase() > b.label.toLowerCase()) {
                            return 1;
                        } else if (b.label.toLowerCase() > a.label.toLowerCase()) {
                            return -1;
                        }

                        return 0;
                    });
                });
            }
        },
    },
});
</script>