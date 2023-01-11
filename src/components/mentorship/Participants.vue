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
                <div v-if="showCycleInputs" class="mb-4">
                    <div class="row">
                        <div class="col-sm-2">
                            Cycle name:
                        </div>
                        <div class="col-sm-4 mb-2">
                            <div class="input-group">
                                <input
                                    v-model="cycleNameInput"
                                    class="form-control form-control-sm"
                                    autocomplete="off"
                                    placeholder="cycle name..."
                                />
                                <div class="input-group-append">
                                    <button
                                        class="btn btn-primary"
                                        href="#"
                                        @click.prevent="updateCycleName($event)"
                                    >
                                        save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-2">
                            Cycle number:
                        </div>
                        <div class="col-sm-4 mb-2">
                            <div class="input-group">
                                <input
                                    v-model.number="cycleNumberInput"
                                    class="form-control form-control-sm"
                                    autocomplete="off"
                                    type="number"
                                    placeholder="cycle number..."
                                />
                                <div class="input-group-append">
                                    <button
                                        class="btn btn-primary"
                                        href="#"
                                        @click.prevent="updateCycleNumber($event)"
                                    >
                                        save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-2">
                            Cycle url:
                        </div>
                        <div class="col-sm-4 mb-2">
                            <div class="input-group">
                                <input
                                    v-model="cycleUrlInput"
                                    class="form-control form-control-sm"
                                    autocomplete="off"
                                    placeholder="cycle url..."
                                />
                                <div class="input-group-append">
                                    <button
                                        class="btn btn-primary"
                                        href="#"
                                        @click.prevent="updateCycleUrl($event)"
                                    >
                                        save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-2">
                            Cycle start date:
                        </div>
                        <div class="col-sm-4 mb-2">
                            <div class="input-group">
                                <input
                                    v-model="cycleStartDateInput"
                                    class="form-control form-control-sm"
                                    type="date"
                                    placeholder="cycle start date..."
                                />
                                <div class="input-group-append">
                                    <button
                                        class="btn btn-primary"
                                        href="#"
                                        @click.prevent="updateCycleStartDate($event)"
                                    >
                                        save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-2">
                            Cycle end date:
                        </div>
                        <div class="col-sm-4 mb-2">
                            <div class="input-group">
                                <input
                                    v-model="cycleEndDateInput"
                                    class="form-control form-control-sm"
                                    type="date"
                                    placeholder="cycle end date..."
                                />
                                <div class="input-group-append">
                                    <button
                                        class="btn btn-primary"
                                        href="#"
                                        @click.prevent="updateCycleEndDate($event)"
                                    >
                                        save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <a href="#" @click.prevent="showCycleInputs = !showCycleInputs">
                        stop editing (close without saving)
                    </a>
                </div>
                <h4 v-else>
                    {{ selectedCycle.name }}
                    <a href="#" @click.prevent="showCycleInputs = !showCycleInputs">
                        {{ showCycleInputs ? 'close' : '' }} <i v-if="!showCycleInputs" class="fas fa-edit" />
                    </a>
                </h4>
                <h5 class="text-secondary small">
                    {{ selectedCycle.startDate.slice(0,10) }} - {{ selectedCycle.endDate.slice(0,10) }}
                </h5>

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
            showCycleInputs: false,
            cycleNameInput: null,
            cycleNumberInput: null,
            cycleUrlInput: null,
            cycleStartDateInput: new Date(),
            cycleEndDateInput: new Date(),
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
            this.cycleNameInput = this.selectedCycle.name;
            this.cycleNumberInput = this.selectedCycle.number;
            this.cycleUrlInput = this.selectedCycle.url;
            this.cycleStartDateInput = new Date(this.selectedCycle.startDate);
            this.cycleEndDateInput = new Date(this.selectedCycle.endDate);
        },
    },
    beforeCreate () {
        if (!this.$store.hasModule('mentorship')) {
            this.$store.registerModule('mentorship', mentorshipModule);
        }
    },
    methods: {
        async updateCycleName(e): Promise<void> {
            const cycle: any = await this.$http.executePost(`/mentorship/updateCycleName`, { cycleId: this.selectedCycle.id, name: this.cycleNameInput }, e);

            if (!this.$http.isError(cycle)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated cycle name`,
                    type: 'info',
                });
                this.$store.commit('mentorship/updateCycle', cycle);
            }
        },
        async updateCycleNumber(e): Promise<void> {
            const cycle: any = await this.$http.executePost(`/mentorship/updateCycleNumber`, { cycleId: this.selectedCycle.id, number: this.cycleNumberInput }, e);

            if (!this.$http.isError(cycle)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated cycle number`,
                    type: 'info',
                });
                this.$store.commit('mentorship/updateCycle', cycle);
            }
        },
        async updateCycleUrl(e): Promise<void> {
            const cycle: any = await this.$http.executePost(`/mentorship/updateCycleUrl`, { cycleId: this.selectedCycle.id, url: this.cycleUrlInput }, e);

            if (!this.$http.isError(cycle)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated cycle url`,
                    type: 'info',
                });
                this.$store.commit('mentorship/updateCycle', cycle);
            }
        },
        async updateCycleStartDate(e): Promise<void> {
            console.log(this.cycleStartDateInput);
            const cycle: any = await this.$http.executePost(`/mentorship/updateCycleStartDate`, { cycleId: this.selectedCycle.id, startDate: this.cycleStartDateInput }, e);

            if (!this.$http.isError(cycle)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated cycle start date`,
                    type: 'info',
                });
                this.$store.commit('mentorship/updateCycle', cycle);
            }
        },
        async updateCycleEndDate(e): Promise<void> {
            const cycle: any = await this.$http.executePost(`/mentorship/updateCycleEndDate`, { cycleId: this.selectedCycle.id, endDate: this.cycleEndDateInput }, e);

            if (!this.$http.isError(cycle)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated cycle end date`,
                    type: 'info',
                });
                this.$store.commit('mentorship/updateCycle', cycle);
            }
        },
    },
});
</script>
