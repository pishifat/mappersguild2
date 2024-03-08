<template>
    <div>
        <participants />
        <user-details />
        <hr />
        <cycles />
        <administrators />
        <add-restricted-user />
        <tenure-badges />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import mentorshipModule from '@store/mentorship';
import { User } from '@interfaces/user';
import { MentorshipCycle } from '@interfaces/mentorshipCycle';
import Administrators from '@components/mentorship/Administrators.vue';
import Cycles from '@components/mentorship/Cycles.vue';
import Participants from '@components/mentorship/Participants.vue';
import UserDetails from '@components/mentorship/UserDetails.vue';
import AddRestrictedUser from '@components/mentorship/AddRestrictedUser.vue';
import TenureBadges from '@components/mentorship/TenureBadges.vue';

export default defineComponent({
    name: 'MentorshipPage',
    components: {
        Administrators,
        Cycles,
        Participants,
        UserDetails,
        AddRestrictedUser,
        TenureBadges,
    },
    data () {
        return {
            userInput: null,
            confirmDelete: null,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapGetters('mentorship', [
            'allCycles',
        ]),
    },
    beforeCreate () {
        if (!this.$store.hasModule('mentorship')) {
            this.$store.registerModule('mentorship', mentorshipModule);
        }
    },
    async created () {
        const res = await this.$http.initialRequest<{ admins: User[], cycles: MentorshipCycle[] }>('/mentorship/query');

        if (!this.$http.isError(res)) {
            this.$store.commit('mentorship/setAdmins', res.admins);
            this.$store.commit('mentorship/setCycles', res.cycles);
        }
    },
    methods: {
    },
});
</script>
