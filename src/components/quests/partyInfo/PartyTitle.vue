<template>
    <div class="row">
        <div class="col-sm">
            <h5 class="d-inline-block">
                <user-link :user="party.leader" />'s party
            </h5>

            <!-- party rank icon -->
            <i
                v-if="party.rank > 0"
                class="fas fa-crown fa-sm"
                :class="'text-rank-' + party.rank"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                :title="`rank ${party.rank} party`"
            />

            <lock-detail
                v-if="isOpen"
                :party="party"
            />

            <!-- ACTIONS -->
            <template v-if="loggedInUser.id != party.leader.id">
                <!-- only open quest -->
                <button v-if="!memberOfAnyParty && !party.lock && isOpen" class="btn btn-sm btn-outline-info ms-1" @click.prevent="joinParty($event)">
                    Join <i class="fas fa-user-plus fa-xs" />
                </button>
                <!-- open & wip -->
                <button v-if="inCurrentParty && (isOpen || isWip)" class="btn btn-sm btn-outline-danger ms-1" @click.prevent="leaveParty($event)">
                    Leave <i class="fas fa-user-minus fa-xs" />
                </button>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { Party } from '@interfaces/party';
import LockDetail from './LockDetail.vue';
import partyInfoMixin from './partyInfoMixin';
import { Quest } from '@interfaces/quest';

export default defineComponent({
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
            const party = await this.$http.executePost<Party>(`/parties/${this.party.id}/join`, {}, e);

            if (!this.$http.isError(party)) {
                this.$store.dispatch('quests/updateParty', party);
            }
        },
        async leaveParty(e): Promise<void> {
            if (confirm(`Are you sure? ${this.party.members.length == this.quest.minParty && this.isWip ? 'This party has the minimum required members to run the quest, so leaving will cause the quest to be dropped.' : ''}`)) {
                const party = await this.$http.executePost<Party>(`/parties/${this.party.id}/leave`, {}, e);

                if (!this.$http.isError(party)) {
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
            const quests = await this.$http.executePost<Quest[]>(`/quests/${this.quest.id}/drop`, {}, e);

            if (!this.$http.isError(quests)) {
                this.$store.dispatch('quests/setQuests', quests);
                this.$bs.hideModal('editQuest');
            }
        },
    },
});
</script>
