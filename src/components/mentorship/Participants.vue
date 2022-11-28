<template>
    <div>
        <div class="container card card-body py-3 mb-2">
            <div class="row">
                <div class="col-sm-6 mb-2">
                    <select
                        v-model="cycleId"
                        class="form-select form-select d-inline"
                    >
                        <option value="" selected disabled>
                            Select a cycle
                        </option>
                        <option v-for="cycle in allCycles" :key="cycle.id" :value="cycle.id">
                            {{ cycle.number }} - {{ cycle.name }}
                        </option>
                    </select>
                </div>
            </div>
            <div v-if="selectedCycle">
                <hr />
                <h4>{{ selectedCycle.name }}</h4>
                <div>
                    <h5>Mentors</h5>
                    <div class="row">
                        <participant-list
                            :group="'mentor'"
                            :mode="'osu'"
                            :users="cycleOsuMentors"
                        />
                        <participant-list
                            :group="'mentor'"
                            :mode="'taiko'"
                            :users="cycleTaikoMentors"
                        />
                        <participant-list
                            :group="'mentor'"
                            :mode="'catch'"
                            :users="cycleCatchMentors"
                        />
                        <participant-list
                            :group="'mentor'"
                            :mode="'mania'"
                            :users="cycleManiaMentors"
                        />
                    </div>
                </div>
                <div class="mt-2">
                    <h5>Mentees</h5>
                    <div class="row">
                        <participant-list
                            :group="'mentee'"
                            :mode="'osu'"
                            :users="cycleOsuMentees"
                        />
                        <participant-list
                            :group="'mentee'"
                            :mode="'taiko'"
                            :users="cycleTaikoMentees"
                        />
                        <participant-list
                            :group="'mentee'"
                            :mode="'catch'"
                            :users="cycleCatchMentees"
                        />
                        <participant-list
                            :group="'mentee'"
                            :mode="'mania'"
                            :users="cycleManiaMentees"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import mentorshipModule from '@store/mentorship';
import ParticipantList from '@components/mentorship/ParticipantList.vue';

export default defineComponent({
    name: 'Participants',
    components: {
        ParticipantList,
    },
    data () {
        return {
            cycleId: '',
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapGetters('mentorship', [
            'allCycles',
            'selectedCycle',
            'cycleOsuMentors',
            'cycleTaikoMentors',
            'cycleCatchMentors',
            'cycleManiaMentors',
            'cycleOsuMentees',
            'cycleTaikoMentees',
            'cycleCatchMentees',
            'cycleManiaMentees',
        ]),
    },
    watch: {
        cycleId(): void {
            this.$store.commit('mentorship/setSelectedCycleId', this.cycleId);
        },
    },
    beforeCreate () {
        if (!this.$store.hasModule('mentorship')) {
            this.$store.registerModule('mentorship', mentorshipModule);
        }
    },
});
</script>
