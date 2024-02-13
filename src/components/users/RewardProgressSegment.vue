<template>
    <div
        :key="$route.query.id"
        v-bs-tooltip="`${tooltipText} (${Math.round(points)} points)`"
        class="segment"
        :class="bgClass"
        :style="generateWidth(points)"
    >
        <span class="segment-text">{{ displayText }} ({{ Math.round(points) }}pts)</span>
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
    },
    computed: {
        ...mapGetters('users', [
            'selectedUser',
        ]),
        maxPoints () {
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

            console.log(width);

            return `width: ${width}%;`;
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