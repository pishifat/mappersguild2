<template>
    <div class="col-sm-12">
        <div class="card bg-dark">
            <div class="card-body p-0 mx-2 my-1">
                <div class="row">
                    <span class="col-sm-4">
                        <a
                            :href="'#details' + artist.id"
                            data-bs-toggle="collapse"
                            class="ms-1"
                            @click.prevent
                        >
                            {{ artist.label }}
                            <i class="fas fa-angle-down" />
                        </a>
                    </span>
                    <span class="small col-sm-8">
                        <span v-if="artist.isUpToDate" class="text-secondary">up to date</span>
                        <span v-else>
                            <span v-if="artist.projectedRelease" class="text-done me-1">{{ new Date(artist.projectedRelease).toString().slice(4,15) }}</span>

                            <span v-if="artist.contractSent">
                                <span class="text-danger">
                                    <span v-if="!artist.artistSigned" class="me-1">[artist signed]</span>
                                    <span v-if="!artist.ppySigned" class="me-1">[ppy signed]</span>
                                    <span v-if="!artist.ppyPaid" class="me-1">[ppy paid]</span>
                                </span>
                                <span v-if="artist.ppySigned && artist.ppyPaid" class="text-danger">
                                    <span v-if="!artist.assetsReceived" class="me-1">[images]</span>
                                    <span v-if="!artist.songsReceived" class="me-1">[songs]</span>
                                    <span v-if="!artist.songsTimed && artist.songsReceived" class="me-1">[timing]</span>
                                </span>
                            </span>

                            <span v-else class="text-secondary">
                                <span v-if="artist.isRejected">{{ artist.isResponded ? 'stopped responding/rejected ' : 'no response ' }}</span>
                            </span>

                            <span class="text-secondary">
                                <span v-if="!artist.hasRankedMaps" class="me-1 text-danger">[showcase]</span>
                            </span>
                        </span>

                        <!--right side buttons-->
                        <a
                            v-if="!artist.isContacted"
                            v-bs-tooltip="'delete'"
                            href="#"
                            class="float-end small text-danger ms-2"
                            @click.prevent="deleteArtist()"
                        >
                            <i class="fas fa-trash" />
                        </a>
                        <a
                            v-bs-tooltip="'reset progress (except notes)'"
                            href="#"
                            class="float-end small text-danger"
                            @click.prevent="reset()"
                        >
                            <i class="fas fa-undo-alt" />
                        </a>

                        <!--contacted-->
                        <span class="text-center font-8 text-secondary float-end me-2">
                            <span v-if="artist.lastContacted">
                                {{ `${daysAgo} ${daysAgo == 1 ? 'day ago' : 'days ago'}` }}
                            </span>
                            <span v-else>
                                never
                            </span>
                            <a href="#" class="ms-1" @click.prevent="showContactedInput = !showContactedInput">
                                <i class="fas fa-edit" />
                            </a>
                        </span>
                        <span v-if="showContactedInput" class="small float-end">
                            <input
                                v-model="contactedInput"
                                class="small w-50"
                                type="text"
                                placeholder="yyyy-mm-dd"
                                style="border-radius: 5px 5px 5px 5px; "
                                maxlength="10"
                                @keyup.enter="updateLastContacted()"
                            />
                            <a class="ms-1" href="#" @click.stop.prevent="updateLastContacted(true)">mark as today</a>
                        </span>
                    </span>
                </div>
                <!--collapsed info-->
                <div :id="'details' + artist.id" class="collapse ms-4 row">
                    <div class="col-sm-2">
                        <div class="sub-header">
                            <u>Discussion</u>
                        </div>
                        <div class="small ms-2">
                            Contacted:
                            <a href="#" @click.stop.prevent="toggleIsContacted()">
                                <i class="fas" :class="artist.isContacted ? 'text-done fa-check' : 'text-danger fa-times'" />
                            </a>
                        </div>
                        <div class="small ms-2">
                            Responded:
                            <a href="#" @click.stop.prevent="toggleIsResponded()">
                                <i class="fas" :class="artist.isResponded ? 'text-done fa-check' : 'text-danger fa-times'" />
                            </a>
                        </div>
                        <div class="small ms-2">
                            Rejected:
                            <a href="#" @click.stop.prevent="toggleIsRejected()">
                                <i class="fas" :class="artist.isRejected ? 'text-done fa-check' : 'text-danger fa-times'" />
                            </a>
                        </div>
                    </div>

                    <div class="col-sm-2">
                        <div class="sub-header">
                            <u>Contract</u>
                        </div>
                        <div class="small ms-2">
                            Sent:
                            <a href="#" @click.stop.prevent="toggleContractSent()">
                                <i class="fas" :class="artist.contractSent ? 'text-done fa-check' : 'text-danger fa-times'" />
                            </a>
                        </div>
                        <div class="small ms-2">
                            Artist signed:
                            <a href="#" @click.stop.prevent="toggleArtistSigned()">
                                <i class="fas" :class="artist.artistSigned ? 'text-done fa-check' : 'text-danger fa-times'" />
                            </a>
                        </div>
                        <div class="small ms-2">
                            ppy paid:
                            <a href="#" @click.stop.prevent="togglePpyPaid()">
                                <i class="fas" :class="artist.ppyPaid ? 'text-done fa-check' : 'text-danger fa-times'" />
                            </a>
                        </div>
                        <div class="small ms-2">
                            ppy signed:
                            <a href="#" @click.stop.prevent="togglePpySigned()">
                                <i class="fas" :class="artist.ppySigned ? 'text-done fa-check' : 'text-danger fa-times'" />
                            </a>
                        </div>
                    </div>

                    <div class="col-sm-3">
                        <div class="sub-header">
                            <u>Publication</u>
                        </div>

                        <div class="small ms-2">
                            Projected release: <span :class="'text-' + (artist.projectedRelease ? 'done' : 'open')">{{ artist.projectedRelease ? new Date(artist.projectedRelease).toString().slice(4,15) : '...' }}</span>
                            <a href="#" class="ms-1" @click.prevent="showDateInput = !showDateInput">
                                <i class="fas fa-edit" />
                            </a>
                        </div>
                        <p v-if="showDateInput" class="small ms-3">
                            <input
                                v-model="dateInput"
                                class="small w-50"
                                type="text"
                                placeholder="yyyy-mm-dd"
                                style="border-radius: 5px 5px 5px 5px; "
                                maxlength="10"
                                @keyup.enter="updateProjectedRelease()"
                            />
                        </p>
                        <div class="small ms-2">
                            Songs received:
                            <a href="#" @click.stop.prevent="toggleSongsReceived()">
                                <i class="fas" :class="artist.songsReceived ? 'text-done fa-check' : 'text-danger fa-times'" />
                            </a>
                        </div>
                        <div class="small ms-2">
                            Songs timed:
                            <a href="#" @click.stop.prevent="toggleSongsTimed()">
                                <i class="fas" :class="artist.songsTimed ? 'text-done fa-check' : 'text-danger fa-times'" />
                            </a>
                        </div>
                        <div class="small ms-2">
                            Visual assets received:
                            <a href="#" @click.stop.prevent="toggleAssetsReceived()">
                                <i class="fas" :class="artist.assetsReceived ? 'text-done fa-check' : 'text-danger fa-times'" />
                            </a>
                        </div>
                        <div class="small ms-2">
                            Released:
                            <a href="#" @click.stop.prevent="toggleIsUpToDate()">
                                <i class="fas" :class="artist.isUpToDate ? 'text-done fa-check' : 'text-danger fa-times'" />
                            </a>
                        </div>
                    </div>

                    <div class="col-sm-3">
                        <div class="sub-header">
                            <u>Other</u>
                        </div>

                        <div class="small ms-2">
                            Has showcase map:
                            <a href="#" @click.stop.prevent="toggleHasRankedMaps()">
                                <i class="fas" :class="artist.hasRankedMaps ? 'text-done fa-check' : 'text-danger fa-times'" />
                            </a>
                        </div>

                        <div class="small ms-2">
                            Is commission:
                            <a href="#" @click.stop.prevent="toggleIsCommission()">
                                <i class="fas" :class="artist.isCommission ? 'text-done fa-check' : 'text-danger fa-times'" />
                            </a>
                        </div>

                        <div class="small ms-2">
                            Has new songs:
                            <a href="#" @click.stop.prevent="toggleHasNewSongs()">
                                <i class="fas" :class="artist.hasNewSongs ? 'text-done fa-check' : 'text-danger fa-times'" />
                            </a>
                        </div>
                    </div>
                </div>
                <!--notes-->
                <div class="row">
                    <div class="mb-1 ms-2 col-sm-4">
                        <a href="#" class="me-1" @click.prevent="updateNotes(null)">
                            <i class="fas fa-edit" />
                        </a>
                        <span v-if="!showNotesInput" class="small text-secondary" v-html="filterLinks(artist.notes)" />
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
                        />
                    </div>
                    <!--showcase mappers-->
                    <div class="mb-1 col-sm-4">
                        <a href="#" class="me-1" @click.prevent="updateShowcaseMappers(null)">
                            <i class="fas fa-edit" />
                        </a>
                        <span v-if="!showShowcaseMappersInput" class="small text-secondary">
                            <span v-if="!artist.showcaseMappers || !artist.showcaseMappers.length">...</span>
                            <user-link-list v-else :users="artist.showcaseMappers" />
                        </span>
                        <input
                            v-if="showShowcaseMappersInput"
                            v-model="showcaseMappers"
                            class="small w-75"
                            rows="4"
                            type="text"
                            placeholder="enter to submit..."
                            style="border-radius: 5px 5px 5px 5px;"
                            @keyup.enter="updateShowcaseMappers($event)"
                            @change="updateShowcaseMappers($event)"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapMutations } from 'vuex';
import UserLinkList from '@components/UserLinkList.vue';

export default defineComponent({
    name: 'ArtistCard',
    components: {
        UserLinkList,
    },
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
            showShowcaseMappersInput: false,
            tempNotes: '',
            tempShowcaseMappers: '',
            notes: this.artist.notes,
            showcaseMappers: this.showcaseMappersText(this.artist.showcaseMappers),
        };
    },
    computed: {
        daysAgo(): number {
            const today = new Date();
            const contacted = new Date(this.artist.lastContacted);
            const days = Math.round((today.getTime() - contacted.getTime())/(1000*60*60*24));

            return days;
        },
        isInProgress(): boolean {
            return this.artist.isContacted && !this.artist.ppySigned;
        },
    },
    watch: {
        artist(): void {
            this.tempNotes = this.artist.notes;
            this.tempShowcaseMappers = this.showcaseMappersText(this.artist.showcaseMappers);
        },
    },
    created () {
        this.tempNotes = this.artist.notes;
        this.tempShowcaseMappers = this.showcaseMappersText(this.artist.showcaseMappers);
    },
    methods: {
        ...mapMutations([
            'updateArtist',
            'deleteArtist',
        ]),
        filterLinks (text): string {
            return (text || '...').replace(
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
        showcaseMappersText(users): string {
            let text = '';

            if (!users || !users.length) {
                return text;
            } else {
                for (const user of users) {
                    text += user.username + ', ';
                }

                return text.slice(0, text.length - 2);
            }
        },
        async toggleIsContacted (): Promise<void> {
            const artist = await this.$http.executePost('/artists/toggleIsContacted/' + this.artist.id, { value: !this.artist.isContacted });

            if (artist) {
                this.$store.commit('updateArtist', artist);
                this.updateLastContacted(true);
            }
        },
        async toggleIsResponded (): Promise<void> {
            const artist = await this.$http.executePost('/artists/toggleIsResponded/' + this.artist.id, { value: !this.artist.isResponded });

            if (artist) {
                this.$store.commit('updateArtist', artist);
                this.updateLastContacted(true);
            }
        },
        async toggleIsRejected (): Promise<void> {
            const artist = await this.$http.executePost('/artists/toggleIsRejected/' + this.artist.id, { value: !this.artist.isRejected });

            if (artist) {
                this.$store.commit('updateArtist', artist);
                this.updateLastContacted(true);
            }
        },
        async toggleContractSent (): Promise<void> {
            const artist = await this.$http.executePost('/artists/toggleContractSent/' + this.artist.id, { value: !this.artist.contractSent });

            if (artist) {
                this.$store.commit('updateArtist', artist);
                this.updateLastContacted(true);
            }
        },
        async toggleArtistSigned (): Promise<void> {
            const artist = await this.$http.executePost('/artists/toggleArtistSigned/' + this.artist.id, { value: !this.artist.artistSigned });

            if (artist) {
                this.$store.commit('updateArtist', artist);
                this.updateLastContacted(true);
            }
        },
        async togglePpyPaid (): Promise<void> {
            const artist = await this.$http.executePost('/artists/togglePpyPaid/' + this.artist.id, { value: !this.artist.ppyPaid });

            if (artist) {
                this.$store.commit('updateArtist', artist);
                this.updateLastContacted(true);
            }
        },
        async togglePpySigned (): Promise<void> {
            const artist = await this.$http.executePost('/artists/togglePpySigned/' + this.artist.id, { value: !this.artist.ppySigned });

            if (artist) {
                this.$store.commit('updateArtist', artist);
                this.updateLastContacted(true);
            }
        },
        async toggleSongsTimed (): Promise<void> {
            const artist = await this.$http.executePost('/artists/toggleSongsTimed/' + this.artist.id, { value: !this.artist.songsTimed });

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async toggleSongsReceived (): Promise<void> {
            const artist = await this.$http.executePost('/artists/toggleSongsReceived/' + this.artist.id, { value: !this.artist.songsReceived });

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async toggleAssetsReceived (): Promise<void> {
            const artist = await this.$http.executePost('/artists/toggleAssetsReceived/' + this.artist.id, { value: !this.artist.assetsReceived });

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async toggleHasRankedMaps (): Promise<void> {
            const artist = await this.$http.executePost('/artists/toggleHasRankedMaps/' + this.artist.id, { value: !this.artist.hasRankedMaps });

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async toggleIsCommission (): Promise<void> {
            const artist = await this.$http.executePost('/artists/toggleIsCommission/' + this.artist.id, { value: !this.artist.isCommission });

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async toggleHasNewSongs (): Promise<void> {
            const artist = await this.$http.executePost('/artists/toggleHasNewSongs/' + this.artist.id, { value: !this.artist.hasNewSongs });

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async toggleIsUpToDate (): Promise<void> {
            const artist = await this.$http.executePost('/artists/toggleIsUpToDate/' + this.artist.id, { value: !this.artist.isUpToDate });

            if (artist) {
                this.$store.commit('updateArtist', artist);
                this.updateLastContacted(true);
            }
        },
        async updateProjectedRelease (): Promise<void> {
            const date = new Date(this.dateInput.trim());
            date.setHours(date.getHours() + 8); // blame US timezone
            const artist = await this.$http.executePost('/artists/updateProjectedRelease/' + this.artist.id, { date });

            if (artist) {
                this.$store.commit('updateArtist', artist);
                this.showDateInput = false;
            }
        },
        async updateLastContacted (today): Promise<void> {
            let date;

            if (today) {
                date = new Date();
            } else {
                date = new Date(this.contactedInput.trim());
            }

            date.setHours(date.getHours() + 8); // blame US timezone

            const artist = await this.$http.executePost('/artists/updateLastContacted/' + this.artist.id, { date });

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
                const artist = await this.$http.executePost('/artists/updateNotes/' + this.artist.id, { notes: this.notes }, e);

                if (artist) {
                    this.$store.commit('updateArtist', artist);
                }
            }
        },
        async updateShowcaseMappers (e): Promise<void> {
            if (!e || !this.showcaseMappers || !this.showcaseMappers.length) {
                this.showShowcaseMappersInput = !this.showShowcaseMappersInput;
            }

            if (this.showcaseMappers !== this.tempShowcaseMappers) {
                const res: any = await this.$http.executePost('/artists/updateShowcaseMappers/' + this.artist.id, { showcaseMappers: this.showcaseMappers }, e);

                if (res && !res.error) {
                    this.$store.commit('updateArtist', res.artist);
                    if (res.artist.showcaseMappers.length) this.showShowcaseMappersInput = !this.showShowcaseMappersInput;

                    const newShowcaseMappers = this.showcaseMappersText(res.artist.showcaseMappers);
                    this.showcaseMappers = newShowcaseMappers;
                    this.tempShowcaseMappers = newShowcaseMappers;
                }
            }
        },
        async reset (): Promise<void> {
            const artist = await this.$http.executePost('/artists/reset/' + this.artist.id);

            if (artist) {
                this.$store.commit('updateArtist', artist);
            }
        },
        async deleteArtist (): Promise<void> {
            const artist = await this.$http.executePost('/artists/deleteArtist/' + this.artist.id);

            if (artist) {
                this.$store.commit('deleteArtist', artist);
            }
        },
    },
});
</script>

<style scoped>
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
</style>
