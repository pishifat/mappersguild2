<template>
    <modal-dialog id="submitQuest" :title="isAdmin ? 'Add quest' : 'Submit quest'">
        <div class="container">
            <!-- artist -->
            <form-select
                v-model="selectedArtist"
                label="Artist"
                placeholder="No specific artist"
            >
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
            </form-select>
            <div v-if="!isAdmin" class="row col">
                <ul class="small text-secondary">
                    <li>This artist's logo will be used as the quest's icon.</li>
                    <li>If your quest allows songs from a few artists, choose whichever best expresses its theme.</li>
                    <li>If your quest allows songs from many artists, choose "No specific artist".</li>
                    <li>Selecting an artist pre-fills the "Name" and "Objective" fields, though these can still be customized.</li>
                </ul>
            </div>

            <!-- required mapsets -->
            <form-input
                v-model.number="mapsetCount"
                label="Required mapsets"
                type="number"
            />
            <div v-if="!isAdmin" class="row col">
                <ul class="small text-secondary">
                    <li>Submitting quest for approval requires you to spend points correlating to how many mapsets are required. The fewer required mapsets, the more points you'll have to spend (and vice versa).</li>
                    <li>Choosing a number pre-fills various fields, though these can still be customized.</li>
                </ul>
            </div>

            <!-- pre-filled fields -->
            <!-- name -->
            <form-input v-model="name" label="Name" />

            <!-- objective -->
            <form-textarea v-model="objective" label="Objective" />

            <!-- price -->
            <form-input
                v-model.number="price"
                label="Price"
                type="number"
                placeholder="price per party member..."
                description="...points required per party member"
            />

            <!-- timeframe -->
            <form-input
                v-model.number="timeframe"
                label="Timeframe"
                type="number"
                description="...days to complete quest"
            />

            <!-- party size -->
            <form-input
                v-model.number="minParty"
                label="Party size (min)"
                type="number"
            />
            <form-input
                v-model.number="maxParty"
                label="Party size (max)"
                type="number"
                description="...members required to accept quest (min/max)"
            />

            <!-- admin only -->
            <template v-if="isAdmin">
                <!-- party rank -->
                <form-input
                    v-model.number="minRank"
                    label="Party rank (min)"
                    type="number"
                    description="...rank required to accept quest"
                />

                <!-- is MBC -->
                <form-checkbox
                    id="isMbcCheckbox"
                    v-model="isMbc"
                    label="is MBC"
                    info="Toggle isMbc"
                />
            </template>

            <div class="radial-divisor" />

            <div v-if="!isAdmin" class="row col-sm small text-secondary">
                <p>
                    Keep in mind that your quest may need revision before it is approved and published on the Mappers' Guild quest listing!
                </p>
                <p>
                    If your quest is rejected, your spent points will be returned and pishifat will send you a message explaining why it was rejected.
                    You may re-submit the quest with changes according to that message. Minor wording changes will be modified by pishifat without rejection.
                </p>

                <button
                    class="btn btn-outline-success btn-block"
                    :disabled="!enoughPoints"
                    @click="submitQuest($event)"
                >
                    {{ `Submit quest for approval: ${points} pts` }}
                    <i class="fas fa-coins" />
                </button>
            </div>

            <div v-else class="row col-sm">
                <button
                    class="btn btn-outline-secondary btn-block"
                    @click="addToQueue()"
                >
                    Add quest to queue
                    <i class="fas fa-coins" />
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
        </div>
    </modal-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import ModalDialog from '@components/ModalDialog.vue';
import { FeaturedArtist } from '../../../interfaces/featuredArtist';
import { Quest } from '../../../interfaces/quest';
import { PublishQuestsData, PublishQuestsResponse, StatusResponse, SubmitQuestData } from '@interfaces/api/quests';
import FormInput from '@components/admin/FormInput.vue';
import FormTextarea from '@components/admin/FormTextarea.vue';
import FormSelect from '@components/admin/FormSelect.vue';
import FormCheckbox from '@components/admin/FormCheckbox.vue';

export default Vue.extend({
    name: 'SubmitQuestModal',
    components: {
        ModalDialog,
        FormInput,
        FormTextarea,
        FormSelect,
        FormCheckbox,
    },
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
            const data: SubmitQuestData = {
                name: this.name,
                price: this.price,
                descriptionMain: this.objective,
                timeframe: this.timeframe * (24*3600*1000),
                minParty: this.minParty,
                maxParty: this.maxParty,
                art: this.selectedArtistOsuId,
                requiredMapsets: this.mapsetCount,
            };

            const res = await this.executePost<StatusResponse>('/quests/submitQuest', data, e);

            if (!this.isError(res)) {
                $('#submitQuest').modal('hide');
                this.resetQuestDetails();
            }
        },
        async publishQuests(e): Promise<void> { // for pishifat
            const data: PublishQuestsData = {
                quests: this.queuedQuests,
            };

            const res = await this.executePost<PublishQuestsResponse>('/admin/quests/create', data, e);

            if (!this.isError(res)) {
                $('#submitQuest').modal('hide');
                this.queuedQuests = [];
            }
        },
    },
});
</script>
