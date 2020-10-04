<template>
    <div class="col-sm-12">
        <div class="card static-card" :class="isDiscussion && daysAgo > 21 ? 'overdue' : 'bg-dark'">
            <div class="card-body p-0 mx-2 my-1">
                <div class="row">
                    <span class="col-sm-4">
                        <a :href="'#details' + artist.id" data-toggle="collapse" class="ml-1">
                            {{ artist.label }}
                            <i class="fas fa-angle-down" />
                        </a>
                    </span>
                    <span class="small col-sm-8">
                        <span v-if="artist.isUpToDate" class="text-white-50">up to date</span>
                        <span v-else>
                            <span v-if="artist.projectedRelease" class="done">{{ new Date(artist.projectedRelease).toString().slice(4,15) }}</span>

                            <span v-if="artist.contractFinalized">
                                <span class="errors">
                                    <span v-if="!artist.songsReceived">[song assets]</span>
                                    <span v-if="!artist.songsTimed">[timed oszs]</span>
                                    <span v-if="!artist.assetsReceived">[other assets]</span>
                                </span>
                                <span class="text-white-50">
                                    <span v-if="artist.isMinor">[minor]</span>
                                    <span v-if="!artist.hasRankedMaps">[no ranked maps]</span>
                                </span>
                            </span>

                            <span v-else class="text-white-50">
                                <span v-if="artist.isRejected">{{ artist.isResponded ? 'stopped responding' : 'no response' }}</span>
                                <span v-else-if="artist.contractSent">awaiting contract signature</span>
                                <span v-else-if="artist.tracksSelected">awaiting contract details</span>
                                <span v-else-if="artist.isResponded">negotiating</span>
                                <span v-else-if="artist.isContacted">awaiting response</span>
                            </span>
                        </span>

                        <!--right side buttons-->
                        <a
                            v-if="!artist.isContacted"
                            href="#"
                            class="float-right small icon-used ml-2"
                            data-toggle="tooltip"
                            data-placement="top"
                            title="delete"
                            @click.prevent="deleteArtist()"
                        >
                            <i class="fas fa-trash" />
                        </a>
                        <a
                            href="#"
                            class="float-right small icon-used"
                            data-toggle="tooltip"
                            data-placement="top"
                            title="reset progress (except notes)"
                            @click.prevent="reset()"
                        >
                            <i class="fas fa-undo-alt" />
                        </a>

                        <!--contacted-->
                        <span class="text-center font-8 text-white-50 float-right mr-2">
                            <span v-if="artist.lastContacted">
                                {{ `${daysAgo} ${daysAgo == 1 ? 'day ago' : 'days ago'}` }}
                            </span>
                            <span v-else>
                                never
                            </span>
                            <a href="#" @click.prevent="showContactedInput = !showContactedInput">
                                <i class="fas fa-edit" />
                            </a>
                        </span>
                        <span v-if="showContactedInput" class="small float-right">
                            <input
                                v-model="contactedInput"
                                class="small w-50"
                                type="text"
                                placeholder="mm-dd-yyyy"
                                style="border-radius: 5px 5px 5px 5px; "
                                maxlength="10"
                                @keyup.enter="updateLastContacted()"
                            >
                            <a href="#" @click.stop.prevent="contactedToday()">mark as today</a>
                        </span>
                    </span>
                </div>
                <!--collapsed info-->
                <div :id="'details' + artist.id" class="collapse ml-4 row">
                    <div class="col-sm-2">
                        <div class="sub-header">
                            <u>Discussion</u>
                        </div>
                        <div class="small ml-2">
                            Contacted:
                            <a href="#" @click.stop.prevent="toggleIsContacted()">
                                <i class="fas" :class="artist.isContacted ? 'icon-valid fa-check' : 'icon-used fa-times'" />
                            </a>
                        </div>
                        <div class="small ml-2">
                            Responded:
                            <a href="#" @click.stop.prevent="toggleIsResponded()">
                                <i class="fas" :class="artist.isResponded ? 'icon-valid fa-check' : 'icon-used fa-times'" />
                            </a>
                        </div>
                        <div class="small ml-2">
                            Tracks confirmed:
                            <a href="#" @click.stop.prevent="toggleTracksSelected()">
                                <i class="fas" :class="artist.tracksSelected ? 'icon-valid fa-check' : 'icon-used fa-times'" />
                            </a>
                        </div>
                        <div v-if="!artist.tracksSelected" class="small ml-2">
                            Rejected:
                            <a href="#" @click.stop.prevent="toggleIsRejected()">
                                <i class="fas" :class="artist.isRejected ? 'icon-valid fa-check' : 'icon-used fa-times'" />
                            </a>
                        </div>
                    </div>

                    <div class="col-sm-2">
                        <div class="sub-header">
                            <u>Contract</u>
                        </div>
                        <div class="small ml-2">
                            sent:
                            <a href="#" @click.stop.prevent="toggleContractSent()">
                                <i class="fas" :class="artist.contractSent ? 'icon-valid fa-check' : 'icon-used fa-times'" />
                            </a>
                        </div>
                        <div class="small ml-2">
                            finalized:
                            <a href="#" @click.stop.prevent="toggleContractFinalized()">
                                <i class="fas" :class="artist.contractFinalized ? 'icon-valid fa-check' : 'icon-used fa-times'" />
                            </a>
                        </div>
                    </div>

                    <div class="col-sm-3">
                        <div class="sub-header">
                            <u>Publication</u>
                        </div>

                        <div class="small ml-2">
                            Projected release: <span :class="artist.projectedRelease ? 'done' : 'open'">{{ artist.projectedRelease ? new Date(artist.projectedRelease).toString().slice(4,15) : '...' }}</span>
                            <a href="#" @click.prevent="showDateInput = !showDateInput">
                                <i class="fas fa-edit" />
                            </a>
                        </div>
                        <p v-if="showDateInput" class="small ml-3">
                            <input
                                v-model="dateInput"
                                class="small w-50"
                                type="text"
                                placeholder="mm-dd-yyyy"
                                style="border-radius: 5px 5px 5px 5px; "
                                maxlength="10"
                                @keyup.enter="updateProjectedRelease()"
                            >
                        </p>
                        <div class="small ml-2">
                            Songs received:
                            <a href="#" @click.stop.prevent="toggleSongsReceived()">
                                <i class="fas" :class="artist.songsReceived ? 'icon-valid fa-check' : 'icon-used fa-times'" />
                            </a>
                        </div>
                        <div class="small ml-2">
                            Songs timed:
                            <a href="#" @click.stop.prevent="toggleSongsTimed()">
                                <i class="fas" :class="artist.songsTimed ? 'icon-valid fa-check' : 'icon-used fa-times'" />
                            </a>
                        </div>
                        <div v-if="!artist.osuId" class="small ml-2">
                            Visual assets received:
                            <a href="#" @click.stop.prevent="toggleAssetsReceived()">
                                <i class="fas" :class="artist.assetsReceived ? 'icon-valid fa-check' : 'icon-used fa-times'" />
                            </a>
                        </div>
                        <div class="small ml-2">
                            Released:
                            <a href="#" @click.stop.prevent="toggleIsUpToDate()">
                                <i class="fas" :class="artist.isUpToDate ? 'icon-valid fa-check' : 'icon-used fa-times'" />
                            </a>
                        </div>
                    </div>

                    <div class="col-sm-3">
                        <div class="sub-header">
                            <u>Other</u>
                        </div>

                        <div class="small ml-2">
                            Minor release:
                            <a href="#" @click.stop.prevent="toggleIsMinor()">
                                <i class="fas" :class="artist.isMinor ? 'icon-valid fa-check' : 'icon-used fa-times'" />
                            </a>
                        </div>
                        <div v-if="!artist.osuId" class="small ml-2">
                            Ranked maps:
                            <a href="#" @click.stop.prevent="toggleHasRankedMaps()">
                                <i class="fas" :class="artist.hasRankedMaps ? 'icon-valid fa-check' : 'icon-used fa-times'" />
                            </a>
                        </div>
                    </div>
                </div>
                <!--notes-->
                <div class="mb-1 ml-2">
                    <a href="#" @click.prevent="updateNotes(null)">
                        <i class="fas fa-edit" />
                    </a>
                    <span v-if="!showNotesInput" class="small text-white-50" v-html="filterLinks(artist.notes)" />
                    <input
                        v-if="showNotesInput"
                        v-model="notes"
                        class="small w-75"
                        rows="4"
                        type="text"
                        placeholder="enter to submit..."
                        style="border-radius: 5px 5px 5px 5px;"
                        @keyup.enter="updateNotes($event)"
                        @change="updateNotes($event)"
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapMutations, mapState } from 'vuex';

export default Vue.extend({
    name: 'ArtistCard',
    props: {
        artist: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            dateInput: '',
            showDateInput: false,
            contactedInput: '',
            showContactedInput: false,
            showNotesInput: false,
            tempNotes: '',
            notes: this.artist.notes,
        };
    },
    computed: {
        ...mapState([
            'userId',
        ]),
        daysAgo(): number {
            const today = new Date();
            const contacted = new Date(this.artist.lastContacted);
            const days = Math.round((today.getTime() - contacted.getTime())/(1000*60*60*24));

            return days;
        },
        isDiscussion(): boolean {
            return !this.artist.osuId && !this.artist.isUpToDate && this.artist.isResponded && !this.artist.contractFinalized && !this.artist.isRejected;
        },
    },
    watch: {
        artist(): void {
            this.tempNotes = this.artist.notes;
        },
    },
    created () {
        this.tempNotes = this.artist.notes;
    },
    methods: {
        ...mapMutations([
            'updateArtist',
            'deleteArtist',
        ]),
        filterLinks (notes): string {
            return (notes || '...').replace(
                /([^\S]|^)(((https?:\/\/)|(www\.))(\S+))/gi,
                function(match, space, url) {
                    let hyperlink = url;

                    if (!hyperlink.match('^https?://')) {
                        hyperlink = 'http://' + hyperlink;
                    }

                    return space + '<a href="' + hyperlink + '" target="_blank">' + url + '</a>';
                }
            );
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
            this.contactedInput = month + '-' + day + '-' + year;
            this.updateLastContacted();
        },
        async toggleIsContacted (): Promise<void> {
            const artist = await this.executePost('/artists/toggleIsContacted/' + this.artist.id, { value: !this.artist.isContacted });

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async toggleIsResponded (): Promise<void> {
            const artist = await this.executePost('/artists/toggleIsResponded/' + this.artist.id, { value: !this.artist.isResponded });

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async toggleTracksSelected (): Promise<void> {
            const artist = await this.executePost('/artists/toggleTracksSelected/' + this.artist.id, { value: !this.artist.tracksSelected });

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async toggleIsRejected (): Promise<void> {
            const artist = await this.executePost('/artists/toggleIsRejected/' + this.artist.id, { value: !this.artist.isRejected });

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async toggleContractSent (): Promise<void> {
            const artist = await this.executePost('/artists/toggleContractSent/' + this.artist.id, { value: !this.artist.contractSent });

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async toggleContractFinalized (): Promise<void> {
            const artist = await this.executePost('/artists/toggleContractFinalized/' + this.artist.id, { value: !this.artist.contractFinalized });

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async toggleSongsTimed (): Promise<void> {
            const artist = await this.executePost('/artists/toggleSongsTimed/' + this.artist.id, { value: !this.artist.songsTimed });

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async toggleSongsReceived (): Promise<void> {
            const artist = await this.executePost('/artists/toggleSongsReceived/' + this.artist.id, { value: !this.artist.songsReceived });

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async toggleAssetsReceived (): Promise<void> {
            const artist = await this.executePost('/artists/toggleAssetsReceived/' + this.artist.id, { value: !this.artist.assetsReceived });

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async toggleHasRankedMaps (): Promise<void> {
            const artist = await this.executePost('/artists/toggleHasRankedMaps/' + this.artist.id, { value: !this.artist.hasRankedMaps });

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async toggleIsMinor (): Promise<void> {
            const artist = await this.executePost('/artists/toggleIsMinor/' + this.artist.id, { value: !this.artist.isMinor });

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async toggleIsUpToDate (): Promise<void> {
            const artist = await this.executePost('/artists/toggleIsUpToDate/' + this.artist.id, { value: !this.artist.isUpToDate });

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async updateProjectedRelease (): Promise<void> {
            const dateSplit = this.dateInput.split('-');
            const date = new Date(
                parseInt(dateSplit[2], 10),
                parseInt(dateSplit[0], 10) - 1,
                parseInt(dateSplit[1], 10)
            );
            const artist = await this.executePost('/artists/updateProjectedRelease/' + this.artist.id, { date });

            if (artist) {
                this.$store.commit('updateArtist', artist);
                this.showDateInput = false;
            }
        },
        async updateLastContacted (): Promise<void> {
            const dateSplit = this.contactedInput.split('-');
            const date = new Date(
                parseInt(dateSplit[2], 10),
                parseInt(dateSplit[0], 10) - 1,
                parseInt(dateSplit[1], 10)
            );
            const artist = await this.executePost('/artists/updateLastContacted/' + this.artist.id, { date });

            if (artist) {
                this.$store.commit('updateArtist', artist);
                this.showContactedInput = false;
            }
        },
        async updateNotes (e): Promise<void> {
            if (!e) {
                this.showNotesInput = !this.showNotesInput;
            }

            if (this.notes != this.tempNotes) {
                this.notes = this.notes.trim();
                this.showNotesInput = !this.showNotesInput;
                const artist = await this.executePost('/artists/updateNotes/' + this.artist.id, { notes: this.notes }, e);

                if (artist) {
                    this.$store.commit('updateArtist', artist);
                }
            }
        },
        async reset (): Promise<void> {
            const artist = await this.executePost('/artists/reset/' + this.artist.id);

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async deleteArtist (): Promise<void> {
            const artist = await this.executePost('/artists/deleteArtist/' + this.artist.id);

            if (artist) {
                this.$store.commit('deleteArtist', artist);
            }
        },
    },
});
</script>

<style>
.font-8 {
    font-size: 8pt;
}

input,
input:focus {
    background-color: #333;
    color: white;
    border-color: transparent;
    filter: drop-shadow(1px 1px 1px #000000);
    border-radius: 0 100px 100px 0;
}

.collapsing {
    -webkit-transition: none;
    transition: none;
    display: none;
}

.overdue {
    background-color: rgba(255, 251, 0, 0.05)!important;
}
</style>
