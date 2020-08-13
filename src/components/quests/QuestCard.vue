<template>
    <div class="row">
        <div class="col-sm-12">
            <div
                class="card static-card"
                :class="cardClass"
            >
                <a
                    class="card-header row-highlight row no-gutters align-items-center"
                    :href="'#details-' + quest.id"
                    data-toggle="collapse"
                    @click="selectQuest()"
                >
                    <div class="col-sm-1 text-center">
                        <img
                            :src="quest.isMbc ? '../../images/mbc-icon.png' :
                                quest.art ? 'https://assets.ppy.sh/artists/' + quest.art + '/cover.jpg' :
                                '../../images/no-art-icon.png'"
                            class="card-avatar-img"
                        >
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
                            <div class="col-sm small text-white-50">
                                {{ quest.descriptionMain }}
                            </div>
                        </div>
                    </div>

                    <div class="col-sm-1 text-center">
                        <div id="collapse-arrow">
                            <i class="fas fa-2x" :class="wasClicked ? 'fa-caret-up' : 'fa-caret-down'" />
                        </div>
                    </div>

                </a>
                <expiration-info
                    v-if="quest.isExpired"
                    :quest="quest"
                    :collapse="true"
                />
                <party-info
                    v-else
                    :quest="quest"
                    :member-of-any-party="memberOfAnyParty"
                    :collapse="true"
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
import PartyInfo from './partyInfo/PartyInfo.vue';
import ExpirationInfo from './expirationInfo/ExpirationInfo.vue';

export default Vue.extend({
    name: 'QuestCard',
    components: {
        QuestSize,
        QuestPrice,
        QuestTime,
        QuestModes,
        PartyInfo,
        ExpirationInfo,
    },
    props: {
        quest: {
            type: Object,
            required: true,
        },
    },
    data () {
        return {
            wasClicked: false,
        };
    },
    computed: {
        ...mapState([
            'userId',
            'availablePoints',
        ]),
        timeRemaining(): number {
            const now = new Date().getTime();
            const remaning = new Date(this.quest.deadline).getTime() - now;

            return Math.floor(remaning / (1000 * 60 * 60 * 24));
        },
        memberOfAnyParty(): boolean {
            return this.quest.parties.some(p =>
                p.members.some(m => m.id === this.userId)
            );
        },
        cardClass(): string {
            if (this.quest.status == 'wip' && this.timeRemaining < 0) {
                return 'overdue';
            } else if (this.quest.minRank) {
                return 'rank-restricted';
            } else {
                return 'bg-dark';
            }
        },
    },
    methods: {
        selectQuest(): void {
            this.wasClicked = !this.wasClicked;
            history.pushState(null, 'Quests', `/quests?id=${this.quest.id}`);
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
    transition: background-color;
}

.row-highlight:hover {
    background-color: #3a3a3a;
    color: #f5f5f5;
}

.row-highlight:hover #collapse-arrow {
    color: var(--ranked);
}
</style>
