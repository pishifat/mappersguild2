<template>
    <modal-dialog id="editQuest" :header-class="headerClass" :loaded="Boolean(selectedQuest)">
        <template #header>
            <a :href="`/quests?id=${selectedQuest.id}`" target="_blank" class="text-dark">
                {{ selectedQuest.name }}
            </a>
            <span v-if="selectedQuest.creator.username != 'pishifat'">
                created by
                <user-link class="text-dark" :user="selectedQuest.creator" />
            </span>
            <div v-if="selectedQuest.art" class="small">
                <a :href="'https://osu.ppy.sh/beatmaps/artists/' + selectedQuest.art" target="_blank">
                    View featured artist listing
                </a>
            </div>
        </template>

        <template #default>
            <div class="container">
                <div class="row">
                    <div class="col-sm-12 text-center">
                        <span v-if="selectedQuest.art">
                            <a :href="'https://osu.ppy.sh/beatmaps/artists/' + selectedQuest.art" target="_blank">
                                <img :src="'https://assets.ppy.sh/artists/' + selectedQuest.art + '/cover.jpg'" class="card-avatar-img-modal" />
                            </a>
                        </span>

                        <span v-else>
                            <img :src="selectedQuest.isMbc ? '/images/mbc-icon.png' : '/images/no-art-icon.png'" class="card-avatar-img-modal" />
                        </span>
                    </div>
                </div>

                <div class="row mb-3 text-center">
                    <div class="col-sm-12">
                        <h5>{{ selectedQuest.name }}</h5>
                    </div>
                    <div class="col-sm-12 text-white-50">
                        {{ selectedQuest.descriptionMain }}
                    </div>
                </div>

                <div class="row justify-content-center text-center">
                    <div class="col-sm-12">
                        <quest-size
                            :quest="selectedQuest"
                        />
                    </div>
                    <div class="col-sm-6 col-lg-2">
                        <quest-price
                            :price="selectedQuest.price"
                        />
                    </div>
                    <div class="col-sm-6 col-lg-2">
                        <quest-time
                            :timeframe="selectedQuest.timeframe"
                        />
                    </div>
                    <div class="col-sm-6 col-lg-4">
                        <quest-modes
                            :status="selectedQuest.status"
                            :modes="selectedQuest.modes"
                        />
                    </div>
                    <div
                        v-if="selectedQuest.expiration"
                        class="col-sm-6 col-lg-3"
                    >
                        <expiration-date
                            :is-expired="selectedQuest.isExpired"
                            :expiration="new Date(selectedQuest.expiration)"
                        />
                    </div>
                </div>

                <div class="radial-divisor" />

                <reopen-quest
                    v-if="selectedQuest.isExpired"
                    :quest-id="selectedQuest.id"
                    :status="selectedQuest.status"
                    :price="selectedQuest.reopenPrice"
                />

                <party-info
                    v-else
                    :quest="selectedQuest"
                    :member-of-any-party="memberOfAnyParty"
                />
            </div>
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapGetters, mapState } from 'vuex';
import QuestSize from './QuestSize.vue';
import QuestPrice from './QuestPrice.vue';
import QuestTime from './QuestTime.vue';
import QuestModes from './QuestModes.vue';
import PartyInfo from './partyInfo/PartyInfo.vue';
import ModalDialog from '@components/ModalDialog.vue';
import ExpirationDate from './expirationInfo/ExpirationDate.vue';
import ReopenQuest from './expirationInfo/ReopenQuest.vue';

export default defineComponent({
    name: 'QuestInfoModal',
    components: {
        QuestSize,
        QuestPrice,
        QuestTime,
        QuestModes,
        PartyInfo,
        ModalDialog,
        ExpirationDate,
        ReopenQuest,
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapGetters('quests', [
            'selectedQuest',
        ]),
        memberOfAnyParty(): boolean {
            return this.selectedQuest.parties.some(p =>
                p.members.some(m => m.id === this.loggedInUser.id)
            );
        },
        headerClass (): string {
            if (!this.selectedQuest?.creator) return '';

            return this.selectedQuest.creator.username == 'pishifat' ? 'bg-warning' : 'bg-primary';
        },
    },
});
</script>

<style scoped>
.card-avatar-img-modal {
    max-width: 72px;
    max-height: 72px;
    object-fit: cover;
    border-radius: 100%;
    box-shadow: 0 1px 0.5rem rgb(10, 10, 25);
    background-color: rgb(10, 10, 25);
}
</style>
