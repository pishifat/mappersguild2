<template>
    <div v-if="modeMentorships.length" class="col-sm-3">
        <div class="text-center">
            <b :class="modeMentorships.length >= 4 && group == 'mentee' ? 'text-danger' : ''">{{ title }} {{ group }} cycles ({{ mentorshipsToPhases }})</b>
        </div>
        <ul>
            <li v-for="mentorship in modeMentorships" :key="mentorship.id + mode">
                <a :href="mentorship.cycle.url" target="_blank">{{ mentorship.cycle.number }}: {{ mentorship.cycle.name }}</a>
                <span class="small text-secondary"> ({{ calculateDuration([mentorship]) }} days) </span>
                <ul v-if="mentorship.mentor && mentorship.group != 'extraMentor'">
                    <li class="small text-secondary">
                        mentored by
                        <user-link
                            :user="mentorship.mentor"
                        />
                    </li>
                </ul>
                <ul v-if="group == 'mentor' && (findRelevantMentees(mentorship).length)">
                    <li v-for="mentee in findRelevantMentees(mentorship)" :key="mentee.id + mode + mentorship.cycle.id" class="small text-secondary">
                        mentor of
                        <user-link
                            :user="mentee"
                        />
                    </li>
                </ul>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { User } from '@interfaces/user';

export default defineComponent({
    name: 'CycleList',
    props: {
        mode: {
            type: String,
            default: '',
        },
        group: {
            type: String,
            default: '',
        },
    },
    data () {
        return {
            extraMentees: [] as User[],
        };
    },
    computed: {
        ...mapState('mentorship', [
            'selectedUser',
        ]),
        modeMentorships(): any {
            if (this.selectedUser.mentorships) {
                return this.selectedUser.mentorships.filter(m => {
                    let group = m.group;

                    if (group == 'extraMentor') {
                        group = 'mentor';
                    }

                    if (group == this.group && m.mode == this.mode) {
                        return true;
                    }
                });
            }

            return [];
        },
        mentorshipsToPhases(): number {
            if (this.modeMentorships.length) {
                let count = 0;

                for (const mentorship of this.modeMentorships) {
                    if (mentorship.phases.length) {
                        count += mentorship.phases.length/3;
                    }
                }

                return Math.round(count*100)/100;
            }

            return 0;
        },
        modeDuration(): number {
            return this.calculateDuration(this.modeMentorships);
        },
        title(): string {
            if (this.mode == 'modding' || this.mode == 'graduation' || this.mode == 'storyboard') {
                return this.mode;
            } else if (this.mode == 'osu') {
                return 'osu!';
            } else {
                return 'osu!' + this.mode;
            }
        },
    },
    watch: {
        selectedUser(): void {
            this.loadExtraMentees();
        },
    },
    mounted() {
        this.loadExtraMentees();
    },
    methods: {
        async loadExtraMentees() {
            this.extraMentees = [];

            if (this.selectedUser.mentorships) {
                const modeExtraMentorships = this.selectedUser.mentorships.filter(m => {
                    if (m.group == 'extraMentor' && m.mode == this.mode) {
                        return true;
                    }
                });

                for (const mentorship of modeExtraMentorships) {
                    const extraMentees: any = await this.$http.executeGet<{ user: User }>(`/mentorship/findExtraMentees/${mentorship.cycle.id}/${this.selectedUser.id}/${this.mode}`);

                    if (!this.$http.isError(extraMentees)) {
                        this.extraMentees = extraMentees;
                    }
                }
            }
        },
        calculateDuration(mentorships): number {
            let duration = 0;

            for (const mentorship of mentorships) {
                if (new Date() > new Date(mentorship.cycle.endDate)) {
                    const difference = new Date(mentorship.cycle.endDate).getTime() - new Date(mentorship.cycle.startDate).getTime();
                    const days = Math.round((difference*(mentorship.phases.length/3)) / (1000*60*60*24));
                    duration += days;
                }
            }

            return duration;
        },
        findRelevantMentees(argMentorship): User[] {
            const mentees = this.selectedUser.mentees.filter(m => {
                for (const mentorship of m.mentorships) {
                    if (mentorship.cycle.toString() == argMentorship.cycle.id && mentorship.group == 'mentee' && mentorship.mode == this.mode && mentorship.mentor.toString() == this.selectedUser.id) {
                        return true;
                    }
                }
            });

            if (this.extraMentees && this.extraMentees.length) {
                for (const mentee of this.extraMentees) {
                    for (const mentorship of mentee.mentorships) {
                        if (mentorship.cycle.toString() == argMentorship.cycle.id && mentorship.group == 'mentee' && mentorship.mode == this.mode && mentorship.mentor.toString() == argMentorship.mentor.id) {
                            mentees.push(mentee);
                        }
                    }
                }
            }

            return mentees;
        },
    },
});
</script>
