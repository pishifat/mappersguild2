<template>
    <div
        :key="$route.query.id"
        v-bs-tooltip="generateTooltipText()"
        class="segment"
        :class="bgClass"
        :style="generateWidth(points)"
    >
        <span class="segment-text">{{ generateDisplayText() }}</span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapGetters } from 'vuex';

export default defineComponent({
    props: {
        points: {
            type: Number,
            required: true,
        },
        bgClass: {
            type: String,
            required: true,
        },
        tooltipText: {
            type: String,
            required: true,
        },
        displayText: {
            type: String,
            required: true,
        },
        badge: {
            type: String,
            default: 'main',
        },
    },
    computed: {
        ...mapGetters('users', [
            'selectedUser',
        ]),
        maxPoints () {
            if (this.badge == 'mission') {
                if (this.selectedUser.completedMissions.length > 3) {
                    return this.selectedUser.completedMissions.length;
                } else {
                    return 3;
                }
            }

            let maxPoints;

            switch (this.selectedUser.rank) {
                case 0:
                    maxPoints = 100;
                    break;
                case 1:
                    maxPoints = 250;
                    break;
                case 2:
                    maxPoints = 500;
                    break;
                case 3:
                    maxPoints = 1000;
                    break;
                case 4:
                    maxPoints = 2500;
                    break;
                case 5:
                    maxPoints = this.selectedUser.totalPoints;
                    break;
            }

            return maxPoints;
        },
    },
    methods: {
        generateWidth (value) {
            const width = value/(this.maxPoints/100);

            return `width: ${width}%;`;
        },
        generateTooltipText () {
            if (this.badge == 'main') {
                return `${this.tooltipText} (${Math.round(this.points)} points)`;
            } else {
                return this.tooltipText;
            }
        },
        generateDisplayText () {
            if (this.badge == 'main') {
                return `${this.displayText} (${Math.round(this.points)} points)`;
            } else {
                return this.displayText;
            }
        },
    },
});
</script>

<style scoped>
.segment {
    display: inline-block;
    height: 100%;
    min-width: 0;
}
.segment-text {
    display: flex;
    white-space: nowrap;
    overflow: hidden;
    font-size: 12px;
    transform: translateY(10%);
    color: black;
    margin: 4px;
}
</style>