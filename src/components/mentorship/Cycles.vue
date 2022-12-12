<template>
    <div>
        <div class="container card card-body py-3 mb-2">
            <h5>Add cycle</h5>
            <div class="input-group">
                <input
                    v-model.number="cycleNumberInput"
                    class="form-control form-control-sm"
                    autocomplete="off"
                    type="number"
                    placeholder="new cycle number..."
                    @keyup.enter="addCycle($event)"
                />
                <input
                    v-model.number="cycleNameInput"
                    class="form-control form-control-sm"
                    autocomplete="off"
                    placeholder="new cycle name..."
                    @keyup.enter="addCycle($event)"
                />
                <input
                    v-model.number="cycleUrlInput"
                    class="form-control form-control-sm"
                    autocomplete="off"
                    placeholder="cycle details link..."
                    @keyup.enter="addCycle($event)"
                />
                <input
                    v-model="cycleStartInput"
                    class="form-control form-control-sm"
                    type="date"
                    @keyup.enter="addCycle($event)"
                />
                <input
                    v-model="cycleEndInput"
                    class="form-control form-control-sm"
                    type="date"
                    @keyup.enter="addCycle($event)"
                />
                <div class="input-group-append">
                    <button
                        class="btn btn-primary"
                        href="#"
                        @click.prevent="addCycle($event)"
                    >
                        <i class="fas fa-plus fa-xs" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import mentorshipModule from '@store/mentorship';

export default defineComponent({
    name: 'MentorshipPage',
    data () {
        return {
            cycleNumberInput: null,
            cycleNameInput: null,
            cycleUrlInput: null,
            cycleStartInput: null,
            cycleEndInput: null,
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
    methods: {
        async addCycle(e): Promise<void> {
            const result = confirm('Are you sure? Details cannot be changed after adding.');

            if (result) {
                const cycle: any = await this.$http.executePost(`/mentorship/addCycle`, { number: this.cycleNumberInput, name: this.cycleNameInput, url: this.cycleUrlInput, startDate: this.cycleStartInput, endDate: this.cycleEndInput }, e);

                if (!this.$http.isError(cycle)) {
                    this.$store.dispatch('updateToastMessages', {
                        message: `Added "${cycle.number} - ${cycle.name}"`,
                        type: 'info',
                    });
                    const currentCycles = [...this.allCycles];
                    currentCycles.unshift(cycle);
                    this.$store.commit('mentorship/setCycles', currentCycles);
                }
            }
        },
    },
});
</script>
