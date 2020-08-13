<template>
    <div id="reviewQuest" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
            <div v-if="quest" class="modal-content bg-dark">
                <div class="modal-header text-dark bg-rest">
                    <h5 class="modal-title">
                        {{ quest.name }} by
                        <a :href="'https://osu.ppy.sh/users/' + quest.creator.osuId" class="text-dark" target="_blank">
                            {{ quest.creator.username }}
                        </a>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden">
                    <div class="container">
                        <div class="small text-white-50">
                            Artist
                            <a href="#" @click.prevent="showArtistInput = !showArtistInput">
                                <i class="fas fa-edit" />
                            </a>
                        </div>
                        <p v-if="showArtistInput">
                            <input
                                v-model.number="artistInput"
                                class="form-control-sm w-100"
                                type="number"
                                autocomplete="off"
                                placeholder="artist ID..."
                                @change="updateArt($event)"
                            >
                        </p>
                        <p v-else-if="quest.art" class="ml-2">
                            <a :href="'https://osu.ppy.sh/beatmaps/artists/' + quest.art" target="_blank">
                                <img :src="'https://assets.ppy.sh/artists/' + quest.art + '/cover.jpg'" class="card-avatar-img">
                            </a>
                        </p>
                        <p v-else class="ml-2">
                            None
                        </p>
                        <div class="small text-white-50">
                            Name
                            <a href="#" @click.prevent="showNameInput = !showNameInput">
                                <i class="fas fa-edit" />
                            </a>
                        </div>
                        <p v-if="showNameInput">
                            <input
                                v-model="nameInput"
                                class="form-control-sm w-100"
                                type="text"
                                autocomplete="off"
                                placeholder="name..."
                                @change="renameQuest($event)"
                            >
                        </p>
                        <p v-else class="ml-2">
                            {{ quest.name }}
                        </p>
                        <div class="small text-white-50">
                            Objective
                            <a href="#" @click.prevent="showObjectiveInput = !showObjectiveInput">
                                <i class="fas fa-edit" />
                            </a>
                        </div>
                        <p v-if="showObjectiveInput">
                            <textarea
                                v-model="objectiveInput"
                                class="form-control-sm w-100"
                                rows="2"
                                type="text"
                                autocomplete="off"
                                placeholder="objective..."
                                @change="updateDescription($event)"
                            />
                        </p>
                        <p v-else class="ml-2">
                            {{ quest.descriptionMain }}
                        </p>
                        <div class="small text-white-50">
                            Required mapsets
                            <a href="#" @click.prevent="showRequiredMapsetsInput = !showRequiredMapsetsInput">
                                <i class="fas fa-edit" />
                            </a>
                        </div>
                        <p v-if="showRequiredMapsetsInput">
                            <input
                                v-model.number="requiredMapsetsInput"
                                class="form-control-sm w-100"
                                type="number"
                                autocomplete="off"
                                placeholder="required mapsets..."
                                @change="updateRequiredMapsets($event)"
                            >
                        </p>
                        <p v-else class="ml-2">
                            {{ quest.requiredMapsets }}
                        </p>
                        <div class="small text-white-50">
                            Price
                            <a href="#" @click.prevent="showPriceInput = !showPriceInput">
                                <i class="fas fa-edit" />
                            </a>
                        </div>
                        <p v-if="showPriceInput">
                            <input
                                v-model.number="priceInput"
                                class="form-control-sm w-100"
                                type="number"
                                autocomplete="off"
                                placeholder="price per party member..."
                                @change="updatePrice($event)"
                            >
                        </p>
                        <p v-else class="ml-2">
                            {{ quest.price }} points per user
                        </p>
                        <div class="small text-white-50">
                            Timeframe
                            <a href="#" @click.prevent="showTimeframeInput = !showTimeframeInput">
                                <i class="fas fa-edit" />
                            </a>
                        </div>
                        <p v-if="showTimeframeInput">
                            <input
                                v-model.number="timeframeInput"
                                class="form-control-sm w-100"
                                type="number"
                                autocomplete="off"
                                placeholder="days..."
                                @change="updateTimeframe($event)"
                            >
                        </p>
                        <p v-else class="ml-2">
                            {{ quest.timeframe / (24*3600*1000) }} days
                        </p>
                        <div class="small text-white-50">
                            Party size
                            <a href="#" @click.prevent="showPartySizeInput = !showPartySizeInput">
                                <i class="fas fa-edit" />
                            </a>
                        </div>
                        <p v-if="showPartySizeInput">
                            <input
                                v-model.number="minPartyInput"
                                class="form-control-sm w-100"
                                type="number"
                                autocomplete="off"
                                placeholder="minimum"
                                @change="updateMinParty($event)"
                            >
                            <input
                                v-model.number="maxPartyInput"
                                class="form-control-sm w-100"
                                type="number"
                                autocomplete="off"
                                placeholder="maximum"
                                @change="updateMaxParty($event)"
                            >
                        </p>
                        <p v-else class="ml-2">
                            {{ quest.minParty }}-{{ quest.maxParty }} members
                        </p>
                        <div class="small text-white-50">
                            Party rank
                        </div>
                        <p class="ml-2">
                            {{ quest.minRank }} rank required
                        </p>
                        <div class="small text-white-50">
                            MBC
                        </div>
                        <p class="ml-2">
                            {{ quest.isMbc ? 'yes' : 'no' }}
                        </p>

                        <div class="radial-divisor mx-auto my-3" />

                        <button type="submit" class="btn btn-outline-success btn-block" @click="acceptPendingQuest($event)">
                            Publish quest
                        </button>
                        <button type="submit" class="btn btn-outline-danger btn-block" @click="rejectPendingQuest($event)">
                            Reject quest
                        </button>
                        <button class="btn btn-outline-secondary btn-block" data-toggle="collapse" data-target="#forumPm">
                            See rejection message <i class="fas fa-angle-down" />
                        </button>
                        <div id="forumPm" class="collapse">
                            <div class="copy-paste small text-white-50">
                                <samp>hello, you're receiving this message because you submitted a Mappers' Guild quest for review</samp><br><br>
                                <samp>[box=your quest info]</samp>
                                <samp>Artist: {{ 'https://osu.ppy.sh/beatmaps/artists/' + quest.art }}</samp><br><br>
                                <samp>Name: {{ quest.name }}</samp><br><br>
                                <samp>Objective: {{ quest.descriptionMain }}</samp><br><br>
                                <samp>Required mapsets: {{ quest.requiredMapsets }}</samp><br><br>
                                <samp>Price: {{ quest.price }} points per user</samp><br><br>
                                <samp>Timeframe: {{ quest.timeframe / (24*3600*1000) }} days</samp><br><br>
                                <samp>Party size: {{ quest.minParty }}-{{ quest.maxParty }} members</samp>
                                <samp>[/box]</samp><br><br>
                                <samp>your quest has been rejected for the following reason(s):</samp><br><br>
                                <samp>[notice] REASONS [/notice]</samp><br><br>
                                <samp>points spent for submitting the quest have been returned to your "available points" pool. if you'd like to modify the quest according to above feedback, you can resubmit it and i'll review it again! or if you'd like to submit any other quest, that's fine too!</samp><br><br>
                                <samp>thanks for being cool</samp><br><br>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Quest } from '../../../../interfaces/quest';

export default Vue.extend({
    name: 'ReviewQuest',
    props: {
        quest: {
            type: Object as () => Quest,
            required: true,
        },
    },
    data() {
        return {
            showArtistInput: false,
            artistInput: this.quest.art,
            showNameInput: false,
            nameInput: this.quest.name,
            showObjectiveInput: false,
            objectiveInput: this.quest.descriptionMain,
            showRequiredMapsetsInput: false,
            requiredMapsetsInput: this.quest.requiredMapsets,
            showPriceInput: false,
            priceInput: this.quest.price,
            showTimeframeInput: false,
            timeframeInput: this.quest.timeframe / (24*3600*1000),
            showPartySizeInput: false,
            minPartyInput: this.quest.minParty,
            maxPartyInput: this.quest.maxParty,
        };
    },
    watch: {
        quest(): void {
            this.showArtistInput = false;
            this.artistInput = this.quest.art;
            this.showNameInput = false;
            this.nameInput = this.quest.name;
            this.showObjectiveInput = false;
            this.objectiveInput = this.quest.descriptionMain;
            this.showRequiredMapsetsInput = false;
            this.requiredMapsetsInput = this.quest.requiredMapsets;
            this.showPriceInput = false;
            this.priceInput = this.quest.price;
            this.showTimeframeInput = false;
            this.timeframeInput = this.quest.timeframe / (24*3600*1000);
        },
    },
    methods: {
        async acceptPendingQuest(e): Promise<void> {
            const status = await this.executePost(`/admin/quests/${this.quest.id}/publish`, {}, e);

            if (!this.isError(status)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `published quest`,
                    type: 'info',
                });
                this.$store.commit('updateStatus', {
                    questId: this.quest.id,
                    status,
                });
                $('#reviewQuest').modal('hide');
            }
        },
        async rejectPendingQuest(e): Promise<void> {
            const status = await this.executePost(`/admin/quests/${this.quest.id}/reject`, {}, e);

            if (!this.isError(status)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `rejected quest`,
                    type: 'info',
                });
                this.$store.commit('updateStatus', {
                    questId: this.quest.id,
                    status,
                });
                $('#reviewQuest').modal('hide');
            }
        },
        async updateArt(e): Promise<void> {
            const art = await this.executePost(`/admin/quests/${this.quest.id}/updateArt`, { art: this.artistInput }, e);

            if (!this.isError(art)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated artist`,
                    type: 'info',
                });
                this.$store.commit('updateArt', {
                    questId: this.quest.id,
                    art,
                });
                this.showArtistInput = false;
            }
        },
        async renameQuest(e): Promise<void> {
            const name = await this.executePost(`/admin/quests/${this.quest.id}/rename`, { name: this.nameInput }, e);

            if (!this.isError(name)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `renamed quest`,
                    type: 'info',
                });
                this.$store.commit('renameQuest', {
                    questId: this.quest.id,
                    name,
                });
                this.showNameInput = false;
            }
        },
        async updateDescription(e): Promise<void> {
            const description = await this.executePost(`/admin/quests/${this.quest.id}/updateDescription/`, { description: this.objectiveInput }, e);

            if (!this.isError(description)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated quest description`,
                    type: 'info',
                });
                this.$store.commit('updateDescription', {
                    questId: this.quest.id,
                    description,
                });
                this.showObjectiveInput = false;
            }
        },
        async updateRequiredMapsets(e): Promise<void> {
            const requiredMapsets = await this.executePost(`/admin/quests/${this.quest.id}/updateRequiredMapsets`, { requiredMapsets: this.requiredMapsetsInput }, e);

            if (!this.isError(requiredMapsets)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated required mapsets`,
                    type: 'info',
                });
                this.$store.commit('updateRequiredMapsets', {
                    questId: this.quest.id,
                    requiredMapsets,
                });
                this.showRequiredMapsetsInput = false;
            }
        },
        async updatePrice(e): Promise<void> {
            const price = await this.executePost(`/admin/quests/${this.quest.id}/updatePrice`, { price: this.priceInput }, e);

            if (!this.isError(price)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated price`,
                    type: 'info',
                });
                this.$store.commit('updatePrice', {
                    questId: this.quest.id,
                    price,
                });
                this.showPriceInput = false;
            }
        },
        async updateTimeframe(e): Promise<void> {
            const timeframe = await this.executePost(`/admin/quests/${this.quest.id}/updateTimeframe`, { timeframe: this.timeframeInput }, e);

            if (!this.isError(timeframe)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated timeframe`,
                    type: 'info',
                });
                this.$store.commit('updateTimeframe', {
                    questId: this.quest.id,
                    timeframe,
                });
                this.showTimeframeInput = false;
            }
        },
        async updateMinParty(e): Promise<void> {
            const minParty = await this.executePost(`/admin/quests/${this.quest.id}/updateMinParty`, { minParty: this.minPartyInput }, e);

            if (!this.isError(minParty)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated minParty`,
                    type: 'info',
                });
                this.$store.commit('updateMinParty', {
                    questId: this.quest.id,
                    minParty,
                });
                this.showPartySizeInput = false;
            }
        },
        async updateMaxParty(e): Promise<void> {
            const maxParty = await this.executePost(`/admin/quests/${this.quest.id}/updateMaxParty`, { maxParty: this.maxPartyInput }, e);

            if (!this.isError(maxParty)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated maxParty`,
                    type: 'info',
                });
                this.$store.commit('updateMaxParty', {
                    questId: this.quest.id,
                    maxParty,
                });
                this.showPartySizeInput = false;
            }
        },
    },
});
</script>

<style>

.card-avatar-img {
    max-width: 36px;
    max-height: 36px;
    object-fit: cover;
    border-radius: 100%;
    box-shadow: 0 1px 0.5rem rgba(10, 10, 25);
    background-color: rgba(10, 10, 25);
}

</style>