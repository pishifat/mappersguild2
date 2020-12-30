<template>
    <div>
        <div
            class="container card card-body card-level-2 my-1 p-1"
            :class="cardClass"
            style="cursor: pointer"
        >
            <div
                class="row no-gutters align-items-center"
                data-toggle="modal"
                data-target="#editQuest"
                @click="selectQuest"
            >
                <div class="col-sm-1 text-center">
                    <img
                        :src="questIcon"
                        class="card-avatar-img"
                    >
                </div>
                <div class="col-sm-11">
                    <div class="row no-gutters">
                        <div class="col-sm-5">
                            {{ quest.name.length > 40 ? quest.name.slice(0,40) + "..." : quest.name }}
                        </div>

                        <div class="col-sm-7">
                            <div class="row no-gutters">
                                <div class="col-sm-4">
                                    <i v-if="quest.status == 'open' && quest.parties.some(p => !p.lock)" class="fas fa-star-of-life fa-xs text-primary" />
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
import { Quest } from '@interfaces/quest';

export default Vue.extend({
    name: 'QuestCard',
    components: {
        QuestSize,
        QuestPrice,
        QuestTime,
        QuestModes,
    },
    props: {
        quest: {
            type: Object as () => Quest,
            required: true,
        },
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        timeRemaining(): number {
            const now = new Date().getTime();
            const remaning = new Date(this.quest.deadline).getTime() - now;

            return Math.floor(remaning / (1000 * 60 * 60 * 24));
        },
        memberOfAnyParty(): boolean {
            return this.quest.parties.some(p =>
                p.members.some(m => m.id === this.loggedInUser.id)
            );
        },
        cardClass(): string {
            if (this.quest.status == 'wip' && this.timeRemaining < 0) {
                return 'overdue';
            } else if (this.quest.minRank) {
                return 'rank-restricted';
            } else {
                return '';
            }
        },
        questIcon (): string {
            if (this.quest.isMbc) return '/images/mbc-icon.png';
            if (this.quest.art) return 'https://assets.ppy.sh/artists/' + this.quest.art + '/cover.jpg';

            return '/images/no-art-icon.png';
        },
    },
    methods: {
        selectQuest(): void {
            this.$store.commit('quests/setSelectedQuestId', this.quest.id);

            if (this.$route.query.id !== this.quest.id) {
                this.$router.replace(`/quests?id=${this.quest.id}`);
            }
        },
    },
});
</script>

<style scoped>
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
    box-shadow: 0 1px 0.5rem rgb(10, 10, 25);
    background-color: rgb(10, 10, 25);
}
</style>
