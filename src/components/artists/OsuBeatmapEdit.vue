<template>
    <modal-dialog id="editBeatmap" :header-class="beatmap.isLicensed ? 'bg-success' : 'bg-danger'" :loaded="Boolean(beatmap)">
        <template #header>
            <a
                :href="'https://osu.ppy.sh/beatmapsets/' + beatmap.beatmapsetOsuIds[0]"
                target="_blank"
            >
                {{ beatmap.artist }} - {{ beatmap.title }}
            </a>
        </template>

        <template #default>
            <div class="container">
                <div class="row">
                    <div class="col-sm-6">
                        Beatmaps ({{ beatmap.beatmapsetOsuIds.length }}):
                        <ul>
                            <li v-for="osuId in beatmap.beatmapsetOsuIds" :key="osuId">
                                <a
                                    :href="'https://osu.ppy.sh/beatmapsets/' + osuId"
                                    target="_blank"
                                >
                                    {{ beatmap.artist }} - {{ beatmap.title }}
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div v-if="beatmap.sources.length && beatmap.sources[0].length" class="col-sm-6">
                        Sources: ({{ beatmap.sources.length }}):
                        <ul>
                            <li v-for="source in beatmap.sources" :key="source">
                                {{ source }}
                            </li>
                        </ul>
                    </div>
                </div>

                <div>
                    <p class="row">
                        <span class="col-sm-6">
                            Licensed song:
                            <span :class="beatmap.isLicensed ? 'text-success' : 'text-danger'" class="me-2">
                                {{ beatmap.isLicensed ? 'true' : 'false' }}
                            </span>
                        </span>
                        <button class="btn btn-sm btn-outline-info ms-3 w-25" @click="updateIsLicensed($event)">
                            Toggle
                        </button>
                    </p>

                    <div v-if="beatmap.isLicensed">
                        Featured Artists:
                        <ul>
                            <li v-if="!beatmap.featuredArtists.length">
                                ...
                            </li>
                            <li v-for="artist in beatmap.featuredArtists" v-else :key="artist.id">
                                {{ artist.label }}
                            </li>
                        </ul>
                        <div class="row">
                            <select v-model="artistInput" class="form-select form-select-sm mb-2 col-sm-12">
                                <option v-for="artist in artists" :key="artist.id" :value="artist.id">
                                    {{ artist.label }}
                                </option>
                            </select>
                            <button class="btn btn-sm btn-outline-info col-sm-6 w-25 me-2" @click="addArtistToOsuBeatmap($event)">
                                Add to list
                            </button>
                        </div>
                    </div>
                </div>

                <hr>

                <div class="mb-4">
                    Administrators:
                    <ul>
                        <li v-if="!beatmap.administrators.length">
                            ...
                        </li>
                        <li v-for="administrator in beatmap.administrators" v-else :key="administrator">
                            {{ administrator }}
                            <a
                                href="#"
                                class="text-danger"
                                @click.prevent="removeAdministratorFromOsuBeatmap(administrator)"
                            >
                                <i class="fas fa-minus" />
                            </a>
                        </li>
                    </ul>
                    <p class="row">
                        <select v-model="administratorInput" class="form-select form-select-sm mx-2 w-50">
                            <option value="Unknown">
                                Unknown
                            </option>
                            <option value="Independent">
                                Independent
                            </option>
                            <option value="" disabled>
                                ---
                            </option>
                            <option v-for="administrator in administratorPresets" :key="administrator" :value="administrator">
                                {{ administrator }}
                            </option>
                        </select>
                    </p>
                    <p class="row">
                        <input
                            v-model="administratorInput"
                            class="form-control form-control-sm mx-2 w-50"
                            type="text"
                            autocomplete="off"
                            placeholder="custom admin..."
                        >
                        <button class="btn btn-sm btn-outline-info w-25 mx-2" @click="addAdministratorToOsuBeatmap($event)">
                            Add to list
                        </button>
                    </p>
                </div>

                <hr>

                <p class="row">
                    <select v-model="commentInput" class="form-select form-select-sm w-50 mx-2">
                        <option v-for="comment in commentPresets" :key="comment" :value="comment">
                            {{ comment }}
                        </option>
                    </select>
                    <button class="btn btn-sm btn-outline-info w-25" @click="updateComment($event)">
                        Save comment
                    </button>
                </p>
                <p class="row">
                    <input
                        v-model="customCommentInput"
                        class="form-control form-control-sm mx-2 w-50"
                        type="text"
                        autocomplete="off"
                        placeholder="custom comment..."
                    />
                    <button class="btn btn-sm btn-outline-info w-25" @click="updateCustomComment($event)">
                        Save custom comment
                    </button>
                </p>
                <p class="text-secondary small">
                    {{ beatmap.comment }}
                </p>

                <hr />

                <p>
                    <span class="text-small text-secondary">
                        Last checked: {{ beatmap.lastChecked ? new Date(beatmap.lastChecked).toLocaleString() : '...' }}
                    </span>
                    <a href="#" class="ms-1" @click.prevent="showLastCheckedInput = !showLastCheckedInput">
                        <i class="fas fa-edit" />
                    </a>
                    <span v-if="showLastCheckedInput">
                        <input
                            v-model="lastCheckedInput"
                            class="small w-25 form-control form-control-sm mx-2"
                            type="text"
                            placeholder="mm-dd-yyyy"
                            style="border-radius: 5px 5px 5px 5px; "
                            maxlength="10"
                            @keyup.enter="updateLastChecked()"
                        />
                        <a href="#" class="small" @click.stop.prevent="contactedToday()">mark as today</a>
                    </span>
                </p>

                <p class="text-small text-secondary">
                    Updated: {{ new Date(beatmap.updatedAt).toLocaleString() }}
                </p>
            </div>
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import ModalDialog from '@components/ModalDialog.vue';
import { OsuBeatmap } from '../../../interfaces/osuBeatmap';

export default defineComponent({
    name: 'BeatmapInfoAdmin',
    components: {
        ModalDialog,
    },
    props: {
        beatmap: {
            type: Object as () => OsuBeatmap,
            required: true,
        },
    },
    emits: [
        'update:updateBeatmap',
    ],
    data() {
        return {
            commentInput: '',
            customCommentInput: '',
            artistInput: '',
            administratorInput: '',
            showLastCheckedInput: false,
            lastCheckedInput: '',
            administratorPresets: [
                'Universal',
                'Sony',
                'Warner',
                'KONAMI',
                'SMIRAL',
            ],
            commentPresets: [
                'Exclusive',
                'Too expensive',
                'Administrator rejected',
                'No response',
                'No admin contact info',
                'Never contacted',
            ],
        };
    },
    computed: {
        ...mapState({
            artists: (state: any) => state.artists.artists,
        }),
    },
    watch: {
        beatmap(): void {
            this.findBeatmapInfo();
        },
    },
    mounted() {
        this.findBeatmapInfo();
    },
    methods: {
        findBeatmapInfo(): void {
            this.commentInput = this.beatmap.comment;
        },
        updateBeatmap (b): void {
            this.$emit('update:updateBeatmap', b);
        },
        async updateIsLicensed(e): Promise<void> {
            const osuBeatmap = await this.$http.executePost(`/artists/osuBeatmaps/updateIsLicensed/${this.beatmap.id}`, {}, e);
            this.updateBeatmap(osuBeatmap);
        },
        async updateComment(e): Promise<void> {
            const osuBeatmap = await this.$http.executePost(`/artists/osuBeatmaps/updateComment/${this.beatmap.id}`, { comment: this.commentInput }, e);
            this.updateBeatmap(osuBeatmap);
        },
        async updateCustomComment(e): Promise<void> {
            const osuBeatmap = await this.$http.executePost(`/artists/osuBeatmaps/updateComment/${this.beatmap.id}`, { comment: this.customCommentInput }, e);
            this.updateBeatmap(osuBeatmap);
        },
        async addArtistToOsuBeatmap(e): Promise<void> {
            const osuBeatmap = await this.$http.executePost(`/artists/osuBeatmaps/addArtistToOsuBeatmap/${this.beatmap.id}`, { artistId: this.artistInput }, e);
            this.updateBeatmap(osuBeatmap);
        },
        async removeArtistFromOsuBeatmap(e): Promise<void> {
            const osuBeatmap = await this.$http.executePost(`/artists/osuBeatmaps/removeArtistFromOsuBeatmap/${this.beatmap.id}`, { artistId: this.artistInput }, e);
            this.updateBeatmap(osuBeatmap);
        },
        async addAdministratorToOsuBeatmap(e): Promise<void> {
            if (this.administratorInput.length) {
                const osuBeatmap = await this.$http.executePost(`/artists/osuBeatmaps/addAdministratorToOsuBeatmap/${this.beatmap.id}`, { administrator: this.administratorInput }, e);
                this.updateBeatmap(osuBeatmap);
            }
        },
        async removeAdministratorFromOsuBeatmap(administrator): Promise<void> {
            const osuBeatmap = await this.$http.executePost(`/artists/osuBeatmaps/removeAdministratorFromOsuBeatmap/${this.beatmap.id}`, { administrator });
            this.updateBeatmap(osuBeatmap);
        },
        async updateLastChecked(): Promise<void> {
            const dateSplit = this.lastCheckedInput.split('-');
            const date = new Date(
                parseInt(dateSplit[2], 10),
                parseInt(dateSplit[0], 10) - 1,
                parseInt(dateSplit[1], 10)
            );
            const osuBeatmap = await this.$http.executePost(`/artists/osuBeatmaps/updateLastChecked/${this.beatmap.id}`, { date });
            this.updateBeatmap(osuBeatmap);
        },
        contactedToday(): void {
            const date = new Date();
            let month = (date.getMonth() + 1).toString();

            if (month.length == 1) {
                month = '0' + month;
            }

            let day = date.getDate().toString();

            if (day.length == 1) {
                day = '0' + day;
            }

            const year = date.getFullYear();
            this.lastCheckedInput = month + '-' + day + '-' + year;
            this.updateLastChecked();
        },
    },
});
</script>
