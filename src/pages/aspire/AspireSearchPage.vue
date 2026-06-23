<template>
    <div>
        <div class="container card card-body py-4 my-4">
            <h4>Allowed songs</h4>
            <p>
                Search the Aspire 6 Featured Artist allowlist to check whether a song is permitted for your entry,
                which is any FA song released before <b>14 June 2026</b>.
            </p>
            <ul class="mb-0">
                <li>
                    <router-link to="/aspire">
                        Teammates Hub
                    </router-link>
                </li>
                <li>
                    <a href="https://osu.ppy.sh/home/news/2026-06-14-aspire-6" target="_blank">Read the news post</a>
                </li>
            </ul>
        </div>

        <div class="container card card-body mb-4">
            <h5 class="mb-3">
                Search
            </h5>
            <song-search-combobox @update:status="status = $event" />

            <div v-if="status.kind === 'match'" class="aspire-search-banner aspire-search-banner--success mt-4 mb-0">
                <i class="fas fa-check me-1 text-success" />
                <b>{{ status.line }}</b> is allowed for use in Aspire 6!
            </div>
            <div v-else-if="status.kind === 'empty'" class="aspire-search-banner aspire-search-banner--empty mt-4 mb-0">
                No results found for <b>{{ status.query }}</b>.
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SongSearchCombobox from '@components/aspire/SongSearchCombobox.vue';
import type { AspireSearchStatus } from '../../aspire/songIndex';

export default defineComponent({
    name: 'AspireSearchPage',
    components: {
        SongSearchCombobox,
    },
    data () {
        return {
            status: { kind: 'idle' } as AspireSearchStatus,
        };
    },
});
</script>

<style scoped lang="scss">
.aspire-search-banner {
    padding: 0.75rem 1rem;
    border: 1px solid;
    border-radius: var(--bs-border-radius);
}

.aspire-search-banner--success {
    background-color: rgba(var(--bs-success-rgb), 0.12);
    border-color: var(--bs-success);
}

.aspire-search-banner--empty {
    background-color: rgba(var(--bs-secondary-rgb), 0.12);
    border-color: var(--bs-secondary);
}
</style>
