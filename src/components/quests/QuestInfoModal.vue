<template>
    <div id="editQuest" class="modal fade" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div v-if="selectedQuest" class="modal-content bg-dark">
                <div class="modal-header text-dark" :class="selectedQuest.creator.username == 'pishifat' ? 'bg-orange' : 'bg-yellow'">
                    <h5 class="modal-title">
                        <a :href="`/quests?id=${selectedQuest.id}`" target="_blank" class="text-dark">
                            {{ selectedQuest.name }}
                        </a>
                        <span v-if="selectedQuest.creator.username != 'pishifat'">
                            created by
                            <a :href="'https://osu.ppy.sh/users/' + selectedQuest.creator.osuId" target="_blank" class="text-dark">
                                {{ selectedQuest.creator.username }}
                            </a>
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden">
                    <div class="container text-shadow">
                        <div class="row">
                            <div class="col-sm-12 text-center">
                                <span v-if="selectedQuest.art">
                                    <a :href="'https://osu.ppy.sh/beatmaps/artists/' + selectedQuest.art" target="_blank">
                                        <img :src="'https://assets.ppy.sh/artists/' + selectedQuest.art + '/cover.jpg'" class="card-avatar-img-modal">
                                    </a>
                                </span>

                                <span v-else>
                                    <img :src="selectedQuest.isMbc ? '../../images/mbc-icon.png' : '../../images/no-art-icon.png'" class="card-avatar-img-modal">
                                </span>
                            </div>
                        </div>

                        <div class="row mb-3 text-center">
                            <div class="col-sm-12">
                                {{ selectedQuest.name }}
                            </div>
                            <div class="col-sm-12 small text-white-50">
                                {{ selectedQuest.descriptionMain }}
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-sm-4 text-center">
                                <quest-size
                                    :quest="selectedQuest"
                                />
                            </div>
                            <div class="col-sm-2 text-center">
                                <quest-price
                                    :price="selectedQuest.price"
                                />
                            </div>
                            <div class="col-sm-2 text-center">
                                <quest-time
                                    :timeframe="selectedQuest.timeframe"
                                />
                            </div>
                            <div class="col-sm-4 text-center">
                                <quest-modes
                                    :status="selectedQuest.status"
                                    :modes="selectedQuest.modes"
                                />
                            </div>
                        </div>

                        <div class="radial-divisor mx-auto my-3" />

                        <expiration-info
                            v-if="selectedQuest.isExpired"
                            :quest="selectedQuest"
                        />
                        <party-info
                            v-else
                            :quest="selectedQuest"
                            :member-of-any-party="memberOfAnyParty"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import QuestSize from './QuestSize.vue';
import QuestPrice from './QuestPrice.vue';
import QuestTime from './QuestTime.vue';
import QuestModes from './QuestModes.vue';
import PartyInfo from './partyInfo/PartyInfo.vue';
import ExpirationInfo from './expirationInfo/ExpirationInfo.vue';

export default Vue.extend({
    name: 'QuestInfoModal',
    components: {
        QuestSize,
        QuestPrice,
        QuestTime,
        QuestModes,
        PartyInfo,
        ExpirationInfo,
    },
    computed: {
        timeRemaining(): number {
            const now = new Date().getTime();
            const remaning = new Date(this.selectedQuest.deadline).getTime() - now;

            return Math.floor(remaning / (1000 * 60 * 60 * 24));
        },
        ...mapState([
            'userId',
            'selectedQuest',
        ]),
        memberOfAnyParty(): boolean {
            return this.selectedQuest.parties.some(p =>
                p.members.some(m => m.id === this.userId)
            );
        },
    },
});
</script>

<style>
.card-avatar-img-modal {
    max-width: 72px;
    max-height: 72px;
    object-fit: cover;
    border-radius: 100%;
    box-shadow: 0 1px 0.5rem rgba(10, 10, 25);
    background-color: rgba(10, 10, 25);
}
</style>
