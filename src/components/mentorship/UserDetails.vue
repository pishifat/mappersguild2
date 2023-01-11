<template>
    <div>
        <div class="container card card-body py-3">
            <h5>User Details</h5>
            <div class="text-secondary mb-2">
                View a user's mentorship history
            </div>
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
                <div class="mt-2">
                    Mentor for <b>{{ totalMentorDuration }} days</b> across all cycles and game modes
                </div>
                <div class="row mt-2">
                    <cycle-list
                        :mode="'osu'"
                        :group="'mentor'"
                    />
                    <cycle-list
                        :mode="'taiko'"
                        :group="'mentor'"
                    />
                    <cycle-list
                        :mode="'catch'"
                        :group="'mentor'"
                    />
                    <cycle-list
                        :mode="'mania'"
                        :group="'mentor'"
                    />
                    <cycle-list
                        :mode="'modding'"
                        :group="'mentor'"
                    />
                    <cycle-list
                        :mode="'graduation'"
                        :group="'mentor'"
                    />
                </div>
                <div>
                    Mentee for <b>{{ totalMenteeDuration }} days</b> across all cycles and game modes
                </div>
                <div class="row mt-2">
                    <cycle-list
                        :mode="'osu'"
                        :group="'mentee'"
                    />
                    <cycle-list
                        :mode="'taiko'"
                        :group="'mentee'"
                    />
                    <cycle-list
                        :mode="'catch'"
                        :group="'mentee'"
                    />
                    <cycle-list
                        :mode="'mania'"
                        :group="'mentee'"
                    />
                    <cycle-list
                        :mode="'modding'"
                        :group="'mentee'"
                    />
                    <cycle-list
                        :mode="'graduation'"
                        :group="'mentee'"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import mentorshipModule from '@store/mentorship';
import { User } from '@interfaces/user';
import CycleList from '@components/mentorship/CycleList.vue';

export default defineComponent({
    name: 'UserDetails',
    components: {
        CycleList,
    },
    data () {
        return {
            userInput: '',
        };
    },
    computed: {
        ...mapState('mentorship', [
            'selectedUser',
        ]),
        totalMentorDuration(): number {
            const mentorships = this.selectedUser.mentorships.filter(m => {
                if (m.group == 'mentor') {
                    return true;
                }
            });

            const uniqueCycles = mentorships.reduce((unique, b) => {
                if (!unique.some(a => a.cycle.id === b.cycle.id)) {
                    unique.push(b);
                }

                return unique;
            },[]);

            return this.calculateDuration(uniqueCycles);
        },
        totalMenteeDuration(): number {
            const mentorships = this.selectedUser.mentorships.filter(m => {
                if (m.group == 'mentee') {
                    return true;
                }
            });

            const uniqueCycles = mentorships.reduce((unique, b) => {
                if (!unique.some(a => a.cycle.id === b.cycle.id)) {
                    unique.push(b);
                }

                return unique;
            },[]);

            return this.calculateDuration(uniqueCycles);
        },
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
            }
        },
        calculateDuration(mentorships): number {
            let duration = 0;

            for (const mentorship of mentorships) {
                if (new Date() > new Date(mentorship.cycle.endDate)) {
                    const difference = new Date(mentorship.cycle.endDate).getTime() - new Date(mentorship.cycle.startDate).getTime();
                    const days = difference / (1000*60*60*24);
                    duration += days;
                }
            }

            return duration;
        },
    },
});
</script>
