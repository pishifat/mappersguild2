<template>
    <div class="row">
        <div class="col-sm-12">
            <div
                class="card static-card text-shadow"
                :class="quest.minRank ? 'rank-restricted' : (quest.status == 'wip' && timeRemaining < 0) ? 'overdue' : 'bg-dark'"
            >
                <a
                    class="card-header row-highlight row no-gutters align-items-center"
                    :href="'#details-' + quest.id"
                    data-toggle="collapse"
                    @click="wasClicked = !wasClicked"
                >
                    <div class="col-sm-1 text-center">
                        <span v-if="quest.art">
                            <a :href="'https://osu.ppy.sh/beatmaps/artists/' + quest.art" target="_blank">
                                <img :src="'https://assets.ppy.sh/artists/' + quest.art + '/cover.jpg'" class="card-avatar-img">
                            </a>
                        </span>

                        <span v-else>
                            <img :src="'../../images/no-art-icon.png'" class="card-avatar-img">
                        </span>
                    </div>
                    <div class="col-sm-10">
                        <div class="row no-gutters">
                            <div class="col-sm-5">
                                {{ quest.name.length > 40 ? quest.name.slice(0,40) + "..." : quest.name }}
                            </div>

                            <div class="col-sm-7">
                                <div class="row no-gutters">
                                    <div class="col-sm-4">
                                        <quest-size
                                            :quest="quest"
                                        />
                                    </div>
                                    <div class="col-sm-2">
                                        <quest-price
                                            :price="quest.price"
                                        />
                                    </div>
                                    <div class="col-sm-2">
                                        <quest-time
                                            :timeframe="quest.timeframe"
                                        />
                                    </div>
                                    <div class="col-sm-4">
                                        <quest-modes
                                            :status="quest.status"
                                            :modes="quest.modes"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row no-gutters">
                            <div class="col-sm small text-shadow">
                                <span class="text-white-50">{{ quest.descriptionMain }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="col-sm-1 text-center">
                        <div id="collapse-arrow">
                            <i class="fas fa-2x" :class="wasClicked ? 'fa-caret-up' : 'fa-caret-down'" />
                        </div>
                    </div>

                </a>
                <expiration-collapse-info
                    v-if="quest.isExpired"
                    :quest="quest"
                />
                <party-collapse-info
                    v-else
                    :quest="quest"
                    :member-of-any-party="memberOfAnyParty"
                />
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
import PartyCollapseInfo from './partyInfo/PartyCollapseInfo.vue';
import ExpirationCollapseInfo from './expirationInfo/ExpirationCollapseInfo.vue';

export default Vue.extend({
    name: 'QuestCard',
    components: {
        QuestSize,
        QuestPrice,
        QuestTime,
        QuestModes,
        PartyCollapseInfo,
        ExpirationCollapseInfo,
    },
    props: {
        quest: {
            type: Object,
            required: true,
        },
        availablePoints: {
            type: Number,
            default: 0,
        },
    },
    data () {
        return {
            wasClicked: false,
        };
    },
    computed: {
        timeRemaining(): number {
            const now = new Date().getTime();
            const remaning = new Date(this.quest.deadline).getTime() - now;

            return Math.floor(remaning / (1000 * 60 * 60 * 24));
        },
        ...mapState([
            'userId',
        ]),
        memberOfAnyParty(): boolean {
            return this.quest.parties.some(p =>
                p.members.some(m => m.id === this.userId)
            );
        },
    },
});
</script>

<style>
.rank-restricted {
    background-color: rgba(200, 0, 0, 0.05)!important;
}

.overdue {
    background-color: rgba(255, 251, 0, 0.05)!important;
}

.fake-button-disable {
    pointer-events: none;
    opacity: 0.6;
}

.card-avatar-img {
    max-width: 36px;
    max-height: 36px;
    object-fit: cover;
    border-radius: 100%;
    box-shadow: 0 1px 0.5rem rgba(10, 10, 25);
    background-color: rgba(10, 10, 25);
}

.row-highlight {
    transition: background-color 0.2s ease-in;
}

.row-highlight:hover {
    background-color: #3a3a3a;
    color: #f5f5f5;
}

.row-highlight:hover #collapse-arrow {
    color: var(--ranked);
}
</style>
