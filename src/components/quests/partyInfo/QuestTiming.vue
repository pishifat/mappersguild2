<template>
    <div class="row">
        <div class="col-sm">
            <!-- when done -->
            <p v-if="quest.status === 'done'" class="small text-shadow min-spacing ml-3">
                Completed:
                <span class="text-white-50">{{ quest.completed.toString().slice(0,10) }}</span>
            </p>

            <!-- quest info when wip -->
            <div v-if="quest.status === 'wip'">
                <div class="small text-shadow ml-3">
                    Deadline:
                    <span class="text-white-50">{{ quest.deadline.toString().slice(0,10) }}</span>
                </div>
                <div class="small text-shadow min-spacing ml-3">
                    Time remaining:
                    <span :class="timeRemaining > 0 ? 'text-white-50' : 'errors'">{{ timeRemaining }} days</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Quest } from '../../../../interfaces/quest';

export default Vue.extend({
    props: {
        quest: {
            type: Object as () => Quest,
            required: true,
        },
    },
    computed: {
        timeRemaining(): number {
            const now = new Date().getTime();
            const remaning = new Date(this.quest.deadline).getTime() - now;

            return Math.floor(remaning / (1000 * 60 * 60 * 24));
        },
    },
});
</script>
