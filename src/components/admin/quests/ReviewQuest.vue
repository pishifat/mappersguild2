<template>
    <modal-dialog id="reviewQuest" :loaded="Boolean(quest)">
        <template #header>
            {{ quest.name }} by
            <a :href="'https://osu.ppy.sh/users/' + quest.creator.osuId" class="text-dark" target="_blank">
                {{ quest.creator.username }}
            </a>
        </template>

        <template #default>
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
                        class="form-control form-control-sm w-100"
                        type="number"
                        autocomplete="off"
                        placeholder="artist ID..."
                        @change="updateArt($event)"
                    >
                </p>
                <p v-else-if="quest.art" class="ms-2">
                    <a :href="'https://osu.ppy.sh/beatmaps/artists/' + quest.art" target="_blank">
                        <img :src="'https://assets.ppy.sh/artists/' + quest.art + '/cover.jpg'" class="card-avatar-img">
                    </a>
                </p>
                <p v-else class="ms-2">
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
                        class="form-control form-control-sm w-100"
                        type="text"
                        autocomplete="off"
                        placeholder="name..."
                        @change="renameQuest($event)"
                    >
                </p>
                <p v-else class="ms-2">
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
                        class="form-control form-control-sm w-100"
                        rows="2"
                        type="text"
                        autocomplete="off"
                        placeholder="objective..."
                        @change="updateDescription($event)"
                    />
                </p>
                <p v-else class="ms-2">
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
                        class="form-control form-control-sm w-100"
                        type="number"
                        autocomplete="off"
                        placeholder="required mapsets..."
                        @change="updateRequiredMapsets($event)"
                    >
                </p>
                <p v-else class="ms-2">
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
                        class="form-control form-control-sm w-100"
                        type="number"
                        autocomplete="off"
                        placeholder="price per party member..."
                        @change="updatePrice($event)"
                    >
                </p>
                <p v-else class="ms-2">
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
                        class="form-control form-control-sm w-100"
                        type="number"
                        autocomplete="off"
                        placeholder="days..."
                        @change="updateTimeframe($event)"
                    >
                </p>
                <p v-else class="ms-2">
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
                        class="form-control form-control-sm w-100"
                        type="number"
                        autocomplete="off"
                        placeholder="minimum"
                        @change="updateMinParty($event)"
                    >
                    <input
                        v-model.number="maxPartyInput"
                        class="form-control form-control-sm w-100"
                        type="number"
                        autocomplete="off"
                        placeholder="maximum"
                        @change="updateMaxParty($event)"
                    >
                </p>
                <p v-else class="ms-2">
                    {{ quest.minParty }}-{{ quest.maxParty }} members
                </p>
                <div class="small text-white-50">
                    Party rank
                </div>
                <p class="ms-2">
                    {{ quest.minRank }} rank required
                </p>
                <div class="small text-white-50">
                    MBC
                </div>
                <p class="ms-2">
                    {{ quest.isMbc ? 'yes' : 'no' }}
                </p>

                <div class="radial-divisor" />

                <button type="submit" class="btn btn-outline-success w-100" @click="acceptPendingQuest($event)">
                    Publish quest
                </button>
                <button type="submit" class="btn btn-outline-danger w-100" @click="rejectPendingQuest($event)">
                    Reject quest
                </button>
                <button class="btn btn-outline-secondary w-100" data-bs-toggle="collapse" data-bs-target="#forumPm">
                    See rejection message <i class="fas fa-angle-down" />
                </button>
                <div id="forumPm" class="collapse">
                    <copy-paste>
                        <div>hello, you're receiving this message because you submitted a Mappers' Guild quest for review</div>
                        <div>[box=your quest info]</div>
                        <div>Artist: {{ 'https://osu.ppy.sh/beatmaps/artists/' + quest.art }}</div>
                        <div>Name: {{ quest.name }}</div>
                        <div>Objective: {{ quest.descriptionMain }}</div>
                        <div>Required mapsets: {{ quest.requiredMapsets }}</div>
                        <div>Price: {{ quest.price }} points per user</div>
                        <div>Timeframe: {{ quest.timeframe / (24*3600*1000) }} days</div>
                        <div>Party size: {{ quest.minParty }}-{{ quest.maxParty }} members</div>
                        <div>[/box]</div>
                        <div>your quest has been rejected for the following reason(s):</div>
                        <div>[notice] REASONS [/notice]</div>
                        <div>points spent for submitting the quest have been returned to your "available points" pool. if you'd like to modify the quest according to above feedback, you can resubmit it and i'll review it again! or if you'd like to submit any other quest, that's fine too!</div>
                        <div>thanks for being cool</div>
                    </copy-paste>
                </div>
            </div>
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import ModalDialog from '@components/ModalDialog.vue';
import { Quest } from '../../../../interfaces/quest';
import CopyPaste from '../../CopyPaste.vue';

export default Vue.extend({
    name: 'ReviewQuest',
    components: {
        CopyPaste,
        ModalDialog,
    },
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
                this.hideModal('reviewQuest');
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
                this.hideModal('reviewQuest');
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

<style scoped>

.card-avatar-img {
    max-width: 36px;
    max-height: 36px;
    object-fit: cover;
    border-radius: 100%;
    box-shadow: 0 1px 0.5rem rgb(10, 10, 25);
    background-color: rgb(10, 10, 25);
}

</style>