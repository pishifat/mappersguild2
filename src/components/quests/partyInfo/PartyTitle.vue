<template>
    <div class="row">
        <div class="col-sm">
            <h5 class="d-inline-block">
                <a :href="'https://osu.ppy.sh/users/' + party.leader.osuId" target="_blank">
                    {{ party.leader.username }}
                </a>'s party
            </h5>

            <!-- party rank icon -->
            <i
                v-if="party.rank > 0"
                class="fas fa-crown fa-sm"
                :class="'text-rank-' + party.rank"
                data-toggle="tooltip"
                data-placement="top"
                :title="`rank ${party.rank} party`"
            />

            <lock-detail
                v-if="isOpen"
                :party="party"
            />

            <!-- ACTIONS -->
            <template v-if="loggedInUser.id != party.leader.id">
                <!-- only open quest -->
                <button v-if="!memberOfAnyParty && !party.lock && isOpen" class="btn btn-sm btn-outline-info ml-1" @click.prevent="joinParty($event)">
                    Join <i class="fas fa-user-plus fa-xs" />
                </button>
                <!-- open & wip -->
                <button v-if="inCurrentParty && (isOpen || isWip)" class="btn btn-sm btn-outline-danger ml-1" @click.prevent="leaveParty($event)">
                    Leave <i class="fas fa-user-minus fa-xs" />
                </button>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { Party } from '@interfaces/party';
import LockDetail from './LockDetail.vue';
import partyInfoMixin from './partyInfoMixin';
import { Quest } from '@interfaces/quest';

export default Vue.extend({
    name: 'PartyTitle',
    components: {
        LockDetail,
    },
    mixins: [ partyInfoMixin ],
    props: {
        party: {
            type: Object as () => Party,
            required: true,
        },
        quest: {
            type: Object as () => Quest,
            required: true,
        },
        memberOfAnyParty: Boolean,
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        inCurrentParty(): boolean {
            return this.party.members.some(m => m.id === this.loggedInUser.id);
        },
    },
    methods: {
        async joinParty(e): Promise<void> {
            const party = await this.executePost<Party>(`/parties/${this.party.id}/join`, {}, e);

            if (!this.isError(party)) {
                this.$store.dispatch('quests/updateParty', party);
            }
        },
        async leaveParty(e): Promise<void> {
            if (confirm(`Are you sure? ${this.party.members.length == this.quest.minParty && this.isWip ? 'This party has the minimum required members to run the quest, so leaving will cause the quest to be dropped.' : ''}`)) {
                const party = await this.executePost<Party>(`/parties/${this.party.id}/leave`, {}, e);

                if (!this.isError(party)) {
                    this.$store.dispatch('quests/updateParty', party);

                    // TODO in routes
                    // if leaving a party leads to few members or low rank
                    if (
                        this.isWip &&
                        (party.members.length < this.quest.minParty || party.rank < this.quest.minRank)
                    ) {
                        this.dropQuest(e);
                    }
                }
            }
        },
        async dropQuest(e): Promise<void> {
            const quests = await this.executePost<Quest[]>(`/quests/${this.quest.id}/drop`, {}, e);

            if (!this.isError(quests)) {
                this.$store.dispatch('quests/setQuests', quests);
                $('#editQuest').modal('hide');
            }
        },
    },
});
</script>
