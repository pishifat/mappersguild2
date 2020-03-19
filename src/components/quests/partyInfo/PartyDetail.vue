<template>
    <div>
        <template v-if="quest.status === 'open' || quest.status === 'wip'">
            <leader-actions
                v-if="party.leader.id == userId"
                :party="party"
                :status="quest.status"
                :quest="quest"
                :price="price"
            />

            <party-title
                :party="party"
                :status="quest.status"
                :quest-id="quest.id"
                :member-of-any-party="memberOfAnyParty"
            />
        </template>

        <quest-timing
            :quest="quest"
        />

        <mode-detail
            v-if="quest.status === 'open'"
            :party="party"
            :quest-id="quest.id"
        />

        <members-detail
            :members="quest.status === 'done' ? quest.completedMembers : party.members"
            :price="price"
            :status="quest.status"
        />

        <hr>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import LeaderActions from './LeaderActions.vue';
import PartyTitle from './PartyTitle.vue';
import QuestTiming from './QuestTiming.vue';
import MembersDetail from './MembersDetail.vue';
import ModeDetail from './ModeDetail.vue';
import { mapState } from 'vuex';
import { Party } from '../../../../interfaces/party';

export default Vue.extend({
    name: 'PartyDetail',
    components: {
        LeaderActions,
        PartyTitle,
        QuestTiming,
        MembersDetail,
        ModeDetail,
    },
    props: {
        party: {
            type: Object as () => Party,
            default: null,
        },
        quest: {
            type: Object,
            required: true,
        },
        memberOfAnyParty: Boolean,
    },
    computed: {
        ...mapState([
            'userId',
        ]),
        price(): number {
            return this.quest.reward*2 + 10;
        },
    },
});
</script>
