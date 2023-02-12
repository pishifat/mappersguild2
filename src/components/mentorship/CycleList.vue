<template>
    <div class="col-sm-3">
        <div class="text-center">
            <b :class="modeMentorships.length >= 4 && group == 'mentee' ? 'text-danger' : ''">{{ title }} {{ group }} cycles ({{ modeMentorships.length }})</b>
        </div>
        <ul>
            <li v-for="mentorship in modeMentorships" :key="mentorship.id + mode">
                <a :href="mentorship.cycle.url" target="_blank">{{ mentorship.cycle.number }}: {{ mentorship.cycle.name }}</a>
                <span class="small text-secondary"> ({{ calculateDuration([mentorship]) }} days) </span>
                <ul v-if="mentorship.mentor">
                    <li class="small text-secondary">
                        mentored by
                        <user-link
                            :user="mentorship.mentor"
                        />
                    </li>
                </ul>
                <ul v-if="group == 'mentor' && findRelevantMentees(mentorship.cycle.id).length">
                    <li v-for="mentee in findRelevantMentees(mentorship.cycle.id)" :key="mentee.id + mode + mentorship.cycle.id" class="small text-secondary">
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
    computed: {
        ...mapState('mentorship', [
            'selectedUser',
        ]),
        modeMentorships(): any {
            if (this.selectedUser.mentorships) {
                return this.selectedUser.mentorships.filter(m => {
                    if (m.group == this.group && m.mode == this.mode) {
                        return true;
                    }
                });
            }

            return [];
        },
        modeDuration(): number {
            return this.calculateDuration(this.modeMentorships);
        },
        title(): string {
            if (this.mode == 'modding' || this.mode == 'graduation') {
                return this.mode;
            } else if (this.mode == 'osu') {
                return 'osu!';
            } else {
                return 'osu!' + this.mode;
            }
        },
    },
    methods: {
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
        findRelevantMentees(cycleId): User[] {
            return this.selectedUser.mentees.filter(m => {
                for (const mentorship of m.mentorships) {
                    if (mentorship.cycle.toString() == cycleId && mentorship.group == 'mentee' && mentorship.mode == this.mode && mentorship.mentor.toString() == this.selectedUser.id) {
                        return true;
                    }
                }
            });
        },
    },
});
</script>
