<template>
    <div>
        <div class="container card card-body py-3">
            <h5>User Details</h5>
            <div class="input-group w-25">
                <input
                    v-model="userInput"
                    class="form-control form-control-sm"
                    autocomplete="off"
                    placeholder="username/osuId..."
                    @keyup.enter="searchUser($event)"
                />
                <div class="input-group-append">
                    <button
                        class="btn btn-primary"
                        href="#"
                        @click.prevent="searchUser($event)"
                    >
                        <i class="fas fa-search fa-xs" />
                    </button>
                </div>
            </div>
            <div v-if="selectedUser">
                <div>
                    Mentor for <b>{{ totalDuration }} days</b> across all cycles and game modes
                </div>
                <div class="row mt-2">
                    <cycle-list
                        :mode="'osu'"
                        :group="'mentor'"
                        :cycles="osuMentorCycles"
                    />
                    <cycle-list
                        :mode="'taiko'"
                        :group="'mentor'"
                        :cycles="taikoMentorCycles"
                    />
                    <cycle-list
                        :mode="'catch'"
                        :group="'mentor'"
                        :cycles="catchMentorCycles"
                    />
                    <cycle-list
                        :mode="'mania'"
                        :group="'mentor'"
                        :cycles="maniaMentorCycles"
                    />
                </div>
                <div class="row mt-2">
                    <cycle-list
                        :mode="'osu'"
                        :group="'mentee'"
                        :cycles="osuMenteeCycles"
                    />
                    <cycle-list
                        :mode="'taiko'"
                        :group="'mentee'"
                        :cycles="taikoMenteeCycles"
                    />
                    <cycle-list
                        :mode="'catch'"
                        :group="'mentee'"
                        :cycles="catchMenteeCycles"
                    />
                    <cycle-list
                        :mode="'mania'"
                        :group="'mentee'"
                        :cycles="maniaMenteeCycles"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import mentorshipModule from '@store/mentorship';
import { User } from '@interfaces/user';
import { MentorshipCycle } from '@interfaces/mentorshipCycle';
import CycleList from '@components/mentorship/CycleList.vue';

export default defineComponent({
    name: 'UserDetails',
    components: {
        CycleList,
    },
    data () {
        return {
            userInput: '',
            osuMentorCycles: [] as MentorshipCycle[],
            taikoMentorCycles: [] as MentorshipCycle[],
            catchMentorCycles: [] as MentorshipCycle[],
            maniaMentorCycles: [] as MentorshipCycle[],
            osuMenteeCycles: [] as MentorshipCycle[],
            taikoMenteeCycles: [] as MentorshipCycle[],
            catchMenteeCycles: [] as MentorshipCycle[],
            maniaMenteeCycles: [] as MentorshipCycle[],
            totalDuration: 0,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapState('mentorship', [
            'selectedUser',
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
    methods: {
        async searchUser(e): Promise<void> {
            const user: any = await this.$http.executeGet<{ user: User }>('/mentorship/searchUser/' + this.userInput, e);

            if (!this.$http.isError(user)) {
                this.$store.commit('mentorship/setSelectedUser', user);

                this.osuMentorCycles = [];
                this.taikoMentorCycles = [];
                this.catchMentorCycles = [];
                this.maniaMentorCycles = [];
                this.osuMenteeCycles = [];
                this.taikoMenteeCycles = [];
                this.catchMenteeCycles = [];
                this.maniaMenteeCycles = [];

                for (const cycle of this.allCycles) {
                    const osuMentorIds = cycle.osuMentors.map(u => u.id);
                    const taikoMentorIds = cycle.taikoMentors.map(u => u.id);
                    const catchMentorIds = cycle.catchMentors.map(u => u.id);
                    const maniaMentorIds = cycle.maniaMentors.map(u => u.id);
                    const osuMenteeIds = cycle.osuMentees.map(u => u.id);
                    const taikoMenteeIds = cycle.taikoMentees.map(u => u.id);
                    const catchMenteeIds = cycle.catchMentees.map(u => u.id);
                    const maniaMenteeIds = cycle.maniaMentees.map(u => u.id);
                    if (osuMentorIds.includes(user.id)) this.osuMentorCycles.push(cycle);
                    if (taikoMentorIds.includes(user.id)) this.taikoMentorCycles.push(cycle);
                    if (catchMentorIds.includes(user.id)) this.catchMentorCycles.push(cycle);
                    if (maniaMentorIds.includes(user.id)) this.maniaMentorCycles.push(cycle);
                    if (osuMenteeIds.includes(user.id)) this.osuMenteeCycles.push(cycle);
                    if (taikoMenteeIds.includes(user.id)) this.taikoMenteeCycles.push(cycle);
                    if (catchMenteeIds.includes(user.id)) this.catchMenteeCycles.push(cycle);
                    if (maniaMenteeIds.includes(user.id)) this.maniaMenteeCycles.push(cycle);
                }
            }

            // calculate mentorship duration (all modes)

            const allMentorCycles = this.osuMentorCycles.concat(this.taikoMentorCycles, this.catchMentorCycles, this.maniaMentorCycles);

            let duration = 0;

            for (const cycle of allMentorCycles) {
                if (new Date() > new Date(cycle.endDate)) {
                    const difference = new Date(cycle.endDate).getTime() - new Date(cycle.startDate).getTime();
                    const days = difference / (1000*60*60*24);
                    duration += days;
                }
            }

            this.totalDuration = duration;
        },
    },
});
</script>
