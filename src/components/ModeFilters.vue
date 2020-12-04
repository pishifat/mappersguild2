<template>
    <div class="row mt-3">
        <div class="col-auto filter-title">
            Mode
        </div>
        <div class="col">
            <a
                v-for="(modeText, mode) in modes"
                :key="mode"
                href="#"
                class="mode"
                :class="getModeSortClass(mode)"
                @click.prevent="$emit('update-filter-mode', mode)"
            >
                {{ modeText }}
            </a>
            <span v-if="isLoading" class="small text-white-50">loading...</span>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'ModeFilters',
    props: {
        isLoading: Boolean,
        filterMode: {
            type: String,
            default: '',
        },
    },
    data () {
        return {
            modes: {
                any: 'Any',
                osu: 'osu!',
                taiko: 'osu!taiko',
                catch: 'osu!catch',
                mania: 'osu!mania',
            },
        };
    },
    methods: {
        getModeSortClass(mode: string): 'sorted' | 'unsorted' {
            if (this.filterMode === mode) {
                return 'sorted';
            }

            return 'unsorted';
        },
    },
});
</script>
