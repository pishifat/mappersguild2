<template>
    <div>
        <background-page-filters />

        <div class="container card card-body mt-2">
            <h5>Background requirements</h5>
            <div class="text-secondary small">
                <div class="mb-2">
                    <b>Try to get permission for your map's background.</b> It's unrealistic (and annoying to mappers) to police all background usage, but if you support the goal of the Mappers' Guild, please use appropriately permitted backgrounds. At minimum, a <a href="https://osu.ppy.sh/wiki/Community/Mappers_Guild" target="_blank">Mappers' Guild</a> beatmap background should meet these requirements:
                    <ul>
                        <li><b>No AI generated imagery.</b></li>
                        <li><b>No content from other media franchises</b> (e.g. illustration of Mikasa from Attack on Titan), excluding cases where usage is permitted by franchise owners.</li>
                    </ul>
                </div>
                <div class="mb-2">
                    As per <a href="https://osu.ppy.sh/wiki/en/Rules/Content_usage_permissions#visual" target="_blank">osu!'s content usage permissions article</a>...
                    <div>
                        <i>
                            Many image hosting websites have search filters for Creative Commons licensing or non-commercial use. Some websites that mappers have frequently used to find their copyright-free backgrounds include:
                            <ul>
                                <li><a href="https://pixabay.com/" target="_blank">pixabay</a></li>
                                <li><a href="https://unsplash.com/" target="_blank">Unsplash</a></li>
                                <li><a href="https://www.pexels.com/" target="_blank">Pexels</a></li>
                            </ul>
                        </i>
                    </div>
                </div>
            </div>
        </div>

        <div class="container card card-body my-2">
            <h5>User-created backgrounds</h5>
            <div class="text-secondary small">
                <div class="mb-2">
                    <b>These images are created and submitted by osu! players. They can be used as <a href="https://osu.ppy.sh/wiki/Community/Mappers_Guild" target="_blank">Mappers' Guild</a> beatmap backgrounds!</b>
                </div>
                <div class="mb-2">
                    If you created any artwork/photo/imagery and want it listed here, use the button in the top-right (next to the search box).
                </div>
            </div>

            <hr />

            <div class="row">
                <div
                    v-for="background in visibleBackgrounds"
                    :key="background.id"
                    class="col-6 col-md-4 col-lg-3 mb-4 text-center"
                >
                    <a :href="background.link" target="_blank">
                        <img
                            class="img-fluid rounded background-thumbnail"
                            :src="thumbnailUrl(background.link)"
                            :alt="background.name"
                            :title="background.name"
                            @error="onImageError(background)"
                        />
                    </a>
                    <div class="small text-secondary mt-1">
                        <b>{{ background.name }}</b> by <user-link :user="background.user" />
                    </div>
                    <div v-if="background.denied" class="small text-danger">
                        (denied)
                        <div v-if="background.deniedReason" class="text-danger small">
                            <!-- eslint-disable-next-line vue/no-v-html -->
                            (<span v-html="$md.renderInline(background.deniedReason.trim())" />)
                        </div>
                    </div>
                    <div v-else-if="!background.approved" class="small text-success">
                        (pending approval)
                    </div>
                    <div v-else-if="background.hidden" class="small text-warning">
                        (hidden)
                    </div>
                    <div v-if="background.approved && loggedInUser && background.user.id === loggedInUser.id" class="small">
                        <a
                            v-if="confirmHide !== background.id"
                            href="#"
                            class="text-warning"
                            @click.prevent="confirmHide = background.id"
                        >
                            {{ background.hidden ? 'unhide' : 'hide' }}
                        </a>
                        <a
                            v-else
                            :class="processingHide ? 'opacity-50 pe-none' : 'text-danger'"
                            href="#"
                            @click.prevent="toggleHidden(background, $event)"
                        >
                            confirm
                        </a>
                    </div>
                </div>

                <div v-if="!visibleBackgrounds.length" class="text-secondary">
                    No backgrounds found...
                </div>
            </div>

            <div v-if="hasMore" class="text-center mt-2">
                <button
                    class="btn btn-sm btn-primary"
                    type="button"
                    :disabled="isLoadingMore"
                    @click="loadMore($event)"
                >
                    <i class="fas fa-angle-down me-1" /> show more backgrounds <i class="fas fa-angle-down ms-1" />
                </button>
            </div>
        </div>

        <add-background-modal />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { Background } from '@interfaces/background';
import AddBackgroundModal from '@components/backgrounds/AddBackgroundModal.vue';
import BackgroundPageFilters from './BackgroundPageFilters.vue';
import backgroundsModule from '@store/backgrounds';

export default defineComponent({
    name: 'BackgroundPage',
    components: {
        AddBackgroundModal,
        BackgroundPageFilters,
    },
    data () {
        return {
            confirmHide: '',
            processingHide: false,
            hasMore: false,
            isLoadingMore: false,
            initialPageSize: 16,
            pageSize: 8,
            brokenBackgroundIds: [] as string[],
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapState('backgrounds', [
            'backgrounds',
            'filterValue',
            'sortBy',
            'filterCreator',
        ]),
        visibleBackgrounds (): Background[] {
            return this.backgrounds.filter(b => !this.brokenBackgroundIds.includes(b.id));
        },
    },
    watch: {
        filterValue () {
            this.loadBackgrounds();
        },
        sortBy () {
            this.loadBackgrounds();
        },
        filterCreator () {
            this.loadBackgrounds();
        },
    },
    beforeCreate () {
        if (!this.$store.hasModule('backgrounds')) {
            this.$store.registerModule('backgrounds', backgroundsModule);
        }
    },
    unmounted () {
        if (this.$store.hasModule('backgrounds')) {
            this.$store.unregisterModule('backgrounds');
        }
    },
    async created () {
        await this.loadBackgrounds();
    },
    methods: {
        onImageError (background: Background): void {
            const isOwnBackground = this.loggedInUser && background.user.id === this.loggedInUser.id;

            if (!isOwnBackground && !this.brokenBackgroundIds.includes(background.id)) {
                this.brokenBackgroundIds.push(background.id);
            }
        },
        thumbnailUrl (link: string): string {
            if (!link.includes('res.cloudinary.com')) {
                return link;
            }

            return link.replace('/upload/', '/upload/w_400,q_auto,f_auto/');
        },
        makeQuery (skip: number, limit: number): string {
            const params = new URLSearchParams();
            params.set('sort', this.sortBy);
            params.set('creator', this.filterCreator);
            params.set('skip', skip.toString());
            params.set('limit', limit.toString());

            if (this.filterValue.trim()) {
                params.set('search', this.filterValue.trim());
            }

            return params.toString();
        },
        async loadBackgrounds (): Promise<void> {
            const backgrounds = await this.$http.executeGet<Background[]>(`/backgrounds?${this.makeQuery(0, this.initialPageSize)}`);

            if (!this.$http.isError(backgrounds)) {
                this.$store.commit('backgrounds/setBackgrounds', backgrounds);
                this.hasMore = this.filterCreator !== 'me' && backgrounds.length === this.initialPageSize;
            }
        },
        async loadMore (e): Promise<void> {
            this.isLoadingMore = true;
            const backgrounds = await this.$http.executeGet<Background[]>(`/backgrounds?${this.makeQuery(this.backgrounds.length, this.pageSize)}`, e);

            if (!this.$http.isError(backgrounds)) {
                this.$store.commit('backgrounds/appendBackgrounds', backgrounds);
                this.hasMore = backgrounds.length === this.pageSize;
            }

            this.isLoadingMore = false;
        },
        async toggleHidden (background: Background, e): Promise<void> {
            this.processingHide = true;
            const updated = await this.$http.executePost<Background>(`/backgrounds/${background.id}/toggleHidden`, {}, e);

            if (!this.$http.isError(updated)) {
                this.$store.dispatch('updateToastMessages', {
                    message: updated.hidden ? 'hid background' : 'unhid background',
                    type: 'info',
                });
                this.$store.commit('backgrounds/updateBackground', updated);
            }

            this.processingHide = false;
            this.confirmHide = '';
        },
    },
});
</script>

<style scoped>
.background-thumbnail {
    width: 100%;
    height: 160px;
    object-fit: cover;
}
</style>
