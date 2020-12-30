<template>
    <div class="container card card-body mt-1">
        <template v-if="isOpen || isWip">
            <leader-actions
                v-if="party.leader.id == loggedInUser.id"
                :party="party"
                :status="quest.status"
                :quest="quest"
                :price="quest.price"
            />

            <party-title
                :party="party"
                :quest="quest"
                :member-of-any-party="memberOfAnyParty"
            />
        </template>

        <quest-timing
            v-if="isDone || isWip"
            :quest="quest"
        />

        <mode-detail
            v-if="isOpen"
            :party="party"
            :quest-id="quest.id"
        />

        <members-detail
            :members="party.members"
            :price="quest.price"
            :status="quest.status"
        />
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
import partyInfoMixin from './partyInfoMixin';

export default Vue.extend({
    name: 'PartyDetail',
    components: {
        LeaderActions,
        PartyTitle,
        QuestTiming,
        MembersDetail,
        ModeDetail,
    },
    mixins: [ partyInfoMixin ],
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
            'loggedInUser',
        ]),
    },
});
</script>
