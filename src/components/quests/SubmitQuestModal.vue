<template>
    <div id="submitQuest" class="modal fade" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content bg-dark">
                <div class="modal-header text-dark bg-primary">
                    <h5 class="modal-title">
                        {{ isAdmin ? 'Add quest' : 'Submit quest' }}
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden">
                    <div class="container">
                        <div class="form-group row">
                            <!-- artist -->
                            <div class="col-lg-1">
                                <p class="mb-2">
                                    Artist:
                                </p>
                            </div>
                            <div class="col-lg-11">
                                <div id="artistForm" class="input-group input-group-sm">
                                    <select
                                        v-model="selectedArtist"
                                        class="form-control"
                                    >
                                        <option value="">
                                            No specific artist
                                        </option>
                                        <option value="-" disabled>
                                            ---
                                        </option>
                                        <option
                                            v-for="featuredArtist in featuredArtists"
                                            :key="featuredArtist.id"
                                            :value="featuredArtist.osuId + '|' + featuredArtist.label"
                                        >
                                            {{ featuredArtist.label }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div v-if="!isAdmin" class="col-lg-12">
                                <ul class="small text-white-50 mb-2">
                                    <li>This artist's logo will be used as the quest's icon.</li>
                                    <li>If your quest allows songs from a few artists, choose whichever best expresses its theme.</li>
                                    <li>If your quest allows songs from many artists, choose "No specific artist".</li>
                                    <li>Selecting an artist pre-fills the "Name" and "Objective" fields, though these can still be customized.</li>
                                </ul>
                            </div>
                        </div>

                        <!-- required mapsets -->
                        <div class="row">
                            <div class="col-lg-12">
                                <p :class="isAdmin ? 'mb-3' : 'mb-1'">
                                    Required mapsets:
                                    <input
                                        v-model.number="mapsetCount"
                                        class="form-control form-control-sm ml-4"
                                        type="number"
                                        autocomplete="off"
                                        placeholder="required mapsets..."
                                    >
                                </p>
                            </div>
                            <div v-if="!isAdmin" class="col-lg-12">
                                <ul class="small text-white-50 mb-4">
                                    <li>Submitting quest for approval requires you to spend points correlating to how many mapsets are required. The fewer required mapsets, the more points you'll have to spend (and vice versa).</li>
                                    <li>Choosing a number pre-fills various fields, though these can still be customized.</li>
                                </ul>
                            </div>
                        </div>

                        <!-- pre-filled fields -->
                        <div class="row">
                            <!-- name -->
                            <div class="col-lg-2 mb-2">
                                <p>
                                    Name:
                                </p>
                            </div>
                            <div class="col-lg-10 mb-2">
                                <input
                                    v-model="name"
                                    class="form-control form-control-sm w-100"
                                    type="text"
                                    autocomplete="off"
                                    placeholder="name..."
                                >
                            </div>

                            <!-- objective -->
                            <div class="col-lg-2 mb-2">
                                <p>
                                    Objective:
                                </p>
                            </div>
                            <div class="col-lg-10 mb-2">
                                <textarea
                                    v-model="objective"
                                    class="form-control form-control-sm w-100"
                                    rows="2"
                                    type="text"
                                    autocomplete="off"
                                    placeholder="objective..."
                                />
                            </div>

                            <!-- price -->
                            <div class="col-lg-2 mb-2">
                                <p class="mb-2">
                                    Price:
                                </p>
                            </div>
                            <div class="col-lg-2">
                                <input
                                    v-model.number="price"
                                    class="form-control form-control-sm w-100"
                                    type="number"
                                    autocomplete="off"
                                    placeholder="price per party member..."
                                >
                            </div>
                            <div class="col-lg-8 d-flex align-items-center">
                                <span class="small text-white-50">...points required per party member</span>
                            </div>

                            <!-- timeframe -->
                            <div class="col-lg-2 mb-2">
                                <p class="mb-2">
                                    Timeframe:
                                </p>
                            </div>
                            <div class="col-lg-2">
                                <input
                                    v-model.number="timeframe"
                                    class="form-control form-control-sm w-100"
                                    type="number"
                                    autocomplete="off"
                                    placeholder="days..."
                                >
                            </div>
                            <div class="col-lg-8 d-flex align-items-center">
                                <span class="small text-white-50">...days to complete quest</span>
                            </div>

                            <!-- party size -->
                            <div class="col-lg-2 mb-2">
                                <p class="mb-2">
                                    Party size:
                                </p>
                            </div>
                            <div class="col-lg-2">
                                <input
                                    v-model.number="minParty"
                                    class="form-control form-control-sm w-100"
                                    type="number"
                                    autocomplete="off"
                                    placeholder="minimum"
                                >
                            </div>
                            <div class="col-lg-2">
                                <input
                                    v-model.number="maxParty"
                                    class="form-control form-control-sm w-100"
                                    type="number"
                                    autocomplete="off"
                                    placeholder="maximum"
                                >
                            </div>
                            <div class="col-lg-6 d-flex align-items-center">
                                <span class="small text-white-50">...members required to accept quest (min/max)</span>
                            </div>
                        </div>

                        <!-- admin only -->
                        <div v-if="isAdmin" class="row">
                            <!-- party rank -->
                            <div class="col-lg-2 mb-2">
                                <p class="mb-2">
                                    Party rank:
                                </p>
                            </div>
                            <div class="col-lg-2">
                                <input
                                    v-model.number="minRank"
                                    class="form-control form-control-sm w-100"
                                    type="number"
                                    autocomplete="off"
                                    placeholder="rank..."
                                >
                            </div>
                            <div class="col-lg-8 d-flex align-items-center">
                                <span class="small text-white-50">...required to accept quest</span>
                            </div>

                            <!-- is MBC -->
                            <div class="col-lg-2 mb-2">
                                <p class="mb-2">
                                    is MBC:
                                </p>
                            </div>
                            <div class="col-lg-10">
                                <span :class="isMbc ? 'text-success' : 'text-danger'">
                                    {{ isMbc ? 'true' : 'false' }}
                                    <button
                                        class="btn btn-sm btn-outline-secondary"
                                        @click="isMbc = !isMbc"
                                    >
                                        Toggle isMbc
                                    </button>
                                </span>
                            </div>
                        </div>

                        <div class="radial-divisor" />

                        <div v-if="!isAdmin" class="small text-white-50 mx-4">
                            <p>
                                Keep in mind that your quest may need revision before it is approved and published on the Mappers' Guild quest listing!
                            </p>
                            <p>
                                If your quest is rejected, your spent points will be returned and pishifat will send you a message explaining why it was rejected. You may re-submit the quest with changes according to that message. Minor wording changes will be modified by pishifat without rejection.
                            </p>
                        </div>

                        <div v-if="isAdmin">
                            <button
                                class="btn btn-outline-secondary btn-block"
                                @click="addToQueue()"
                            >
                                Add quest to queue
                                <i v-if="!isAdmin" class="fas fa-coins" />
                            </button>

                            <div v-if="queuedQuests.length" class="mt-2">
                                Pending quests
                                <ul class="small text-secondary">
                                    <li v-for="quest in queuedQuests" :key="quest.name">
                                        {{ quest.name }}
                                        <a
                                            href="#"
                                            class="text-danger"
                                            @click.prevent="removeFromQueue(quest.name)"
                                        >
                                            <i class="fas fa-minus" />
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <button
                                v-if="queuedQuests.length"
                                class="btn btn-outline-success btn-block"
                                @click="publishQuests($event)"
                            >
                                Publish quests
                            </button>
                        </div>

                        <button
                            v-else
                            class="btn btn-outline-success btn-block"
                            :disabled="!enoughPoints"
                            @click="submitQuest($event)"
                        >
                            {{ `Submit quest for approval: ${points} pts` }}
                            <i class="fas fa-coins" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { FeaturedArtist } from '../../../interfaces/featuredArtist';
import { Quest } from '../../../interfaces/quest';

export default Vue.extend({
    name: 'SubmitQuestModal',
    props: {
        isAdmin: Boolean,
    },
    data() {
        return {
            featuredArtists: [] as FeaturedArtist[],
            selectedArtist: '',
            mapsetCount: 6,
            name: '',
            price: 0,
            objective: '',
            timeframe: 0,
            minParty: 0,
            maxParty: 0,
            minRank: 0,
            isMbc: false,
            queuedQuests: [] as Partial<Quest>[],
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        packType(): string {
            if (this.mapsetCount == 1) {
                return 'single';
            } else if (this.mapsetCount == 2) {
                return 'double';
            } else if (this.mapsetCount <= 4) {
                return 'mini-pack';
            } else if (this.mapsetCount <= 9) {
                return 'pack';
            } else if (this.mapsetCount >= 10) {
                return 'mega-pack';
            } else {
                return 'invalid-pack';
            }
        },
        selectedArtistOsuId(): string {
            if (this.selectedArtist.length) {
                const artistOptions = this.selectedArtist.split('|');

                return artistOptions[0];
            } else {
                return '';
            }
        },
        selectedArtistName(): string {
            if (this.selectedArtist.length) {
                const artistOptions = this.selectedArtist.split('|');

                return artistOptions[1];
            } else {
                return '';
            }
        },
        points(): number {
            let points = 25;

            if (!this.selectedArtist) {
                points += 10;
            }

            if (this.mapsetCount < 1) {
                points = 727;
            } else if (this.mapsetCount == 1) {
                points += 100;
            } else if (this.mapsetCount < 10) {
                points += (10-this.mapsetCount)*7.5;
            }

            return points;
        },
        enoughPoints(): boolean {
            return (this.loggedInUser.availablePoints - this.points) > 0;
        },
    },
    watch: {
        selectedArtist(): void {
            if (this.selectedArtistName.length && this.mapsetCount > 0) {
                this.name = this.findName();
                this.objective = this.findObjective();
                this.price = this.findPrice();
                this.timeframe = this.findTimeframe();
                this.minParty = this.mapsetCount;
                this.maxParty = this.mapsetCount*3;
            }
        },
        mapsetCount(): void {
            if (this.selectedArtistName.length && this.mapsetCount > 0) {
                this.name = this.findName();
                this.objective = this.findObjective();
                this.price = this.findPrice();
                this.timeframe = this.findTimeframe();
                this.minParty = this.mapsetCount;
                this.maxParty = this.mapsetCount*3;
            }
        },
    },
    async created () {
        const res: any = await this.executeGet<FeaturedArtist[]>('/featuredArtists');

        if (res) {
            this.featuredArtists = res.sort((a, b) => {
                if (a.label.toLowerCase() > b.label.toLowerCase()) return 1;
                if (b.label.toLowerCase() > a.label.toLowerCase()) return -1;

                return 0;
            });
        }
    },
    methods: {
        findName(): string {
            return this.selectedArtistName + ' ' + this.packType;
        },
        findObjective(): string {
            if (this.mapsetCount == 1) {
                return `Create and rank ${this.mapsetCount} mapset of any song by ${this.selectedArtistName}.`;
            } else {
                return `Create and rank at least ${this.mapsetCount} mapsets of songs by ${this.selectedArtistName}, each hosted by a different user.`;
            }
        },
        findPrice(): number {
            switch (this.mapsetCount) {
                case 1:
                    return 20;
                case 2:
                    return 10;
                case 3:
                    return 5;
                default:
                    return 0;
            }
        },
        findTimeframe(): number {
            return this.mapsetCount*10 + 70;
        },
        resetQuestDetails(): void {
            this.selectedArtist = '';
            this.mapsetCount = 6;
            this.name = '';
            this.price = 0;
            this.objective = '';
            this.timeframe = 0;
            this.minParty = 0;
            this.maxParty = 0;
            this.minRank = 0;
            this.isMbc = false;
        },
        addToQueue(): void {
            this.queuedQuests.push({
                name: this.name,
                price: this.price,
                descriptionMain: this.objective,
                timeframe: this.timeframe * (24*3600*1000),
                minParty: this.minParty,
                maxParty: this.maxParty,
                minRank: this.minRank,
                isMbc: this.isMbc,
                art: parseInt(this.selectedArtistOsuId),
                requiredMapsets: this.mapsetCount,
            });

            this.resetQuestDetails();
        },
        removeFromQueue(name): void {
            this.queuedQuests = this.queuedQuests.filter(q => q.name != name);
        },
        async submitQuest(e): Promise<void> { // for normal users
            const quests = await this.executePost('/quests/submitQuest', {
                name: this.name,
                price: this.price,
                descriptionMain: this.objective,
                timeframe: this.timeframe * (24*3600*1000),
                minParty: this.minParty,
                maxParty: this.maxParty,
                art: this.selectedArtistOsuId,
                requiredMapsets: this.mapsetCount,
            }, e);

            if (!this.isError(quests)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Quest submitted for approval`,
                    type: 'info',
                });
                ($('#submitQuest')).modal('hide');
                this.resetQuestDetails();
            }
        },
        async publishQuests(e): Promise<void> { // for pishifat
            const quests = await this.executePost('/admin/quests/create', {
                quests: this.queuedQuests,
            }, e);

            if (!this.isError(quests)) {
                this.$store.commit('setQuests', quests);
                $('#submitQuest').modal('hide');
                this.queuedQuests = [];
            }
        },
    },
});
</script>

<style scoped>

textarea {
    min-height: 52px;
}

</style>