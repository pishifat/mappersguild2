<template>
    <div class="row">
        <div class="col-sm text-shadow">
            <u>
                <a :href="'https://osu.ppy.sh/users/' + party.leader.osuId" target="_blank">
                    {{ party.leader.username }}
                </a>'s party
            </u>
            ({{ party.members.length }})

            <lock-detail
                v-if="status === 'open'"
                :locked="party.lock"
            />

            <!-- party rank icon -->
            <i
                v-if="party.rank > 0"
                class="fas fa-crown"
                :class="party.rank == 1 ? 'text-rank-1' : party.rank == 2 ? 'text-rank-2' : 'text-rank-3'"
                data-toggle="tooltip"
                data-placement="top"
                :title="party.rank == 1 ? 'rank 1 party' : party.rank == 2 ? 'rank 2 party' : 'rank 3 party'"
            />

            <!-- ACTIONS -->
            <!-- only open quest -->
            <button v-if="!memberOfAnyParty && !party.lock && status === 'open'" class="btn btn-sm btn-outline-info" @click.prevent="joinParty($event)">
                Join <i class="fas fa-plus small" />
            </button>
            <!-- open & wip -->
            <button v-if="inCurrentParty && userId != party.leader.id && (status === 'open' || status === 'wip')" class="btn btn-sm btn-outline-danger" @click.prevent="leaveParty($event)">
                Leave <i class="fas fa-minus small" />
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { Quest } from '../../../../interfaces/quest';
import { Party } from '../../../../interfaces/party';
import LockDetail from './LockDetail.vue';

export default Vue.extend({
    name: 'PartyTitle',
    components: {
        LockDetail,
    },
    props: {
        party: {
            type: Object as () => Party,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
        questId: {
            type: String,
            required: true,
        },
        questMinimumParty: {
            type: Number,
            required: true,
        },
        memberOfAnyParty: Boolean,
    },
    computed: {
        ...mapState([
            'userId',
        ]),
        inCurrentParty(): boolean {
            return this.party.members.some(m => m.id === this.userId);
        },
    },
    methods: {
        async joinParty(e): Promise<void> {
            const quest = await this.executePost('/quests/joinParty/' + this.party.id + '/' + this.questId, {}, e);

            if (!this.isError(quest)) {
                this.$store.dispatch('updateQuest', quest);
            }
        },
        async leaveParty(e): Promise<void> {
            if (confirm(`Are you sure? ${this.party.members.length == this.questMinimumParty && this.status == 'wip' ? 'This party has the minimum required members to run the quest, so leaving will cause the quest to be dropped.' : ''}`)) {
                const quest = await this.executePost<Quest>('/quests/leaveParty/' + this.party.id + '/' + this.questId, {}, e);

                if (!this.isError(quest)) {
                    this.$store.dispatch('updateQuest', quest);

                    // TODO in routes
                    // if leaving a party leads to few members or low rank
                    if (quest.status == 'wip' &&
                        (quest.currentParty.members.length < quest.minParty || quest.currentParty.rank < quest.minRank)
                    ) {
                        this.dropQuest(e);
                    }
                }
            }
        },
        async dropQuest(e): Promise<void> {
            const quests = await this.executePost('/quests/dropQuest/' + this.party.id + '/' + this.questId, {}, e);

            if (!this.isError(quests)) {
                this.$store.commit('setQuests', quests);
                $('#editQuest').modal('hide');
            }
        },
    },
});
</script>
