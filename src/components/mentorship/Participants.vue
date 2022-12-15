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
                <h4>
                    {{ selectedCycle.name }}
                    <div class="small text-secondary">
                        {{ selectedCycle.startDate.slice(0,10) }} - {{ selectedCycle.endDate.slice(0,10) }}
                    </div>
                </h4>

                <div>
                    <div class="row">
                        <participant-list
                            :mode="'osu'"
                        />
                        <participant-list
                            :mode="'taiko'"
                        />
                        <participant-list
                            :mode="'catch'"
                        />
                        <participant-list
                            :mode="'mania'"
                        />
                        <participant-list
                            :mode="'modding'"
                        />
                        <participant-list
                            :mode="'graduation'"
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
