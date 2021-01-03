<template>
    <div class="row">
        <div class="col-sm">
            <!-- when done -->
            <div v-if="quest.status === 'done'" class="ms-3">
                Completed:
                <span class="text-secondary">{{ quest.completed.toString().slice(0,10) }}</span>
            </div>

            <!-- quest info when wip -->
            <div v-if="quest.status === 'wip'">
                <div class="ms-3">
                    Deadline:
                    <span class="text-secondary">{{ quest.deadline.toString().slice(0,10) }}</span>
                </div>
                <div class="ms-3">
                    Time remaining:
                    <span :class="timeRemaining > 0 ? 'text-secondary' : 'text-danger'">{{ timeRemaining }} days</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Quest } from '@interfaces/quest';

export default defineComponent({
    props: {
        quest: {
            type: Object as () => Quest,
            required: true,
        },
    },
    computed: {
        timeRemaining(): number {
            if (!this.quest.deadline) return 0;

            const now = new Date().getTime();
            const remaning = new Date(this.quest.deadline).getTime() - now;

            return Math.floor(remaning / (1000 * 60 * 60 * 24));
        },
    },
});
</script>
