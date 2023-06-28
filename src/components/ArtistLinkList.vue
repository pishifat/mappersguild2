<template>
    <a
        v-for="(artist, i) in artists"
        :key="i"
        :href="'https://osu.ppy.sh/beatmaps/artists/' + artist.osuId"
        target="_blank"
    >
        {{ listArtist(artist.label, i, artists.length) }}
    </a>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { FeaturedArtist } from '@interfaces/featuredArtist';

export default defineComponent({
    name: 'ArtistLinkList',
    props: {
        artists: {
            type: Array as PropType<FeaturedArtist[]>,
            required: true,
        },
    },
    methods: {
        listArtist(label: string, i: number, length: number): string {
            return label + (i < length - 1 ? ', ' : '');
        },
    },
});
</script>
