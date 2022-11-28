<template>
    <div class="col-sm-3">
        <div class="text-center">
            <b :class="cycles.length >= 4 && group == 'mentee' ? 'text-danger' : ''">{{ mode == 'osu' ? 'osu!' : 'osu!' + mode }} {{ group }} cycles ({{ cycles.length }})</b>
            <div v-if="group == 'mentor'" class="text-secondary small">
                {{ modeDuration }}
            </div>
        </div>
        <ul>
            <li v-for="cycle in cycles" :key="cycle.id">
                <a :href="cycle.url" target="_blank">{{ cycle.number }} - {{ cycle.name }}</a>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { MentorshipCycle } from '@interfaces/mentorshipCycle';

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
        cycles: {
            type: Array as PropType<MentorshipCycle[]>,
            required: true,
        },
    },
    data () {
        return {
            modeDuration: 0,
        };
    },
    methods: {
        calculateDuration() {
            let duration = 0;

            for (const cycle of this.cycles) {
                if (new Date() > new Date(cycle.endDate)) {
                    const difference = new Date(cycle.endDate).getTime() - new Date(cycle.startDate).getTime();
                    const days = difference / (1000*60*60*24);
                    duration += days;
                }
            }

            this.modeDuration = duration;
        },
    },
});
</script>
