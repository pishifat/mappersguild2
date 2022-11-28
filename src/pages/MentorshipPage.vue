<template>
    <div>
        <participants />
        <user-details />
        <hr />
        <cycles />
        <administrators />
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

export default defineComponent({
    name: 'MentorshipPage',
    components: {
        Administrators,
        Cycles,
        Participants,
        UserDetails,
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

            /*const id = this.$route.query.id;

            if (id) {
                const i = this.allUsers.findIndex(u => u.id == id);

                if (i >= 0) {
                    this.$store.commit('mentorship/setSelectedUserId', id);
                    this.$bs.showModal('extendedInfo');
                }
            }*/
        }
    },
    methods: {
    },
});
</script>
