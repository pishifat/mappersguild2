<template>
    <div class="position-relative">
        <div class="input-group">
            <span class="input-group-text">
                <i class="fas fa-search" />
            </span>
            <input
                v-model="query"
                class="form-control"
                type="text"
                maxlength="200"
                placeholder="artist or song title..."
                autocomplete="off"
                :disabled="loading || !!loadError"
                @input="onInput"
                @keydown="onKeydown"
                @focus="dropdownOpen = true"
                @blur="onBlur"
            />
        </div>

        <div v-if="loading" class="small text-secondary mt-2">
            Loading song list...
        </div>
        <div v-else-if="loadError" class="small text-danger mt-2">
            {{ loadError }}
        </div>

        <ul
            v-else-if="showResultsDropdown"
            class="dropdown-menu show w-100 song-search-dropdown mt-1"
        >
            <li
                v-for="(line, index) in resultLines"
                :key="line"
            >
                <button
                    type="button"
                    class="dropdown-item text-truncate"
                    :class="{ active: index === highlightedIndex }"
                    @mousedown.prevent="selectLine(line)"
                >
                    {{ line }}
                </button>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    loadAspireSongIndex,
    normalizeAspireQuery,
    searchAspireSongs,
} from '../../aspire/songIndex';

const DEBOUNCE_MS = 150;

type SongIndex = Awaited<ReturnType<typeof loadAspireSongIndex>>;

export default defineComponent({
    name: 'SongSearchCombobox',
    emits: ['update:status'],
    data () {
        return {
            query: '',
            loading: true,
            loadError: null as string | null,
            fuse: null as SongIndex | null,
            resultLines: [] as string[],
            dropdownOpen: false,
            highlightedIndex: -1,
            debounceTimer: null as ReturnType<typeof setTimeout> | null,
        };
    },
    computed: {
        normalizedQuery (): string {
            return normalizeAspireQuery(this.query);
        },
        showResultsDropdown (): boolean {
            return this.dropdownOpen
                && this.normalizedQuery.length >= 2
                && this.resultLines.length > 0;
        },
    },
    async mounted () {
        try {
            this.fuse = await loadAspireSongIndex();
        } catch {
            this.loadError = 'Could not load the allowed songs list. Try refreshing the page.';
        } finally {
            this.loading = false;
        }
    },
    beforeUnmount () {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
    },
    methods: {
        onInput (): void {
            this.dropdownOpen = true;
            this.highlightedIndex = -1;

            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }

            this.debounceTimer = setTimeout(() => {
                this.runSearch();
            }, DEBOUNCE_MS);
        },
        runSearch (): void {
            if (!this.fuse) {
                return;
            }

            const { lines, status } = searchAspireSongs(this.fuse, this.query);
            this.resultLines = lines;
            this.$emit('update:status', status);
        },
        selectLine (line: string): void {
            this.$emit('update:status', { kind: 'match', line });
            this.query = line;
            this.resultLines = [line];
            this.dropdownOpen = false;
            this.highlightedIndex = -1;
        },
        onBlur (): void {
            window.setTimeout(() => {
                this.dropdownOpen = false;
            }, 0);
        },
        onKeydown (e: KeyboardEvent): void {
            if (!this.showResultsDropdown) {
                return;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.resultLines.length - 1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
            } else if (e.key === 'Enter') {
                e.preventDefault();

                if (this.highlightedIndex >= 0 && this.resultLines[this.highlightedIndex]) {
                    this.selectLine(this.resultLines[this.highlightedIndex]);
                }
            } else if (e.key === 'Escape') {
                this.dropdownOpen = false;
                this.highlightedIndex = -1;
            }
        },
    },
});
</script>

<style scoped lang="scss">
.song-search-dropdown {
    position: absolute;
    z-index: 1000;
    max-height: 20rem;
    overflow-y: auto;
}
</style>
