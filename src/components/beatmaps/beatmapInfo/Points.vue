<template>
    <div>
        <div class="row">
            <div class="col-sm-12">
                <button
                    v-if="!tasksPointsArray"
                    class="btn btn-sm btn-outline-info ms-1"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="calculate points for all difficulties"
                    @click="findPoints($event)"
                >
                    Calculate points
                </button>
                <span v-if="isLoading" class="small text-white-50 ms-2">
                    calculating...
                </span>
                <span v-else-if="pointsInfo" class="small text-white-50 ms-2">
                    {{ pointsInfo }}
                </span>
            </div>
            <div v-if="tasksPointsArray" class="col-sm-6">
                <ul class="small text-white-50">
                    <li v-for="(value, i) in tasksPointsArray" :key="i">
                        {{ value }}
                    </li>
                </ul>
            </div>
            <div class="col-sm-6">
                <ul v-if="usersPointsArrays" class="small text-white-50">
                    <li v-for="(value, i) in usersPointsArrays" :key="i">
                        {{ usersPointsArrays[i][0] }}: {{ usersPointsArrays[i][1] }}
                    </li>
                </ul>
            </div>
            <div v-if="totalPoints" class="col-sm-12">
                <span class="small text-white-50 ms-2">
                    total: {{ Math.round(totalPoints*10)/10 }}
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Beatmap } from '../../../../interfaces/beatmap/beatmap';

export default defineComponent({
    name: 'Points',
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    data () {
        return {
            tasksPointsArray: null,
            usersPointsArrays: null,
            pointsInfo: null,
            totalPoints: null,
            isLoading: false,
        };
    },
    watch: {
        beatmap (): void {
            this.tasksPointsArray = null;
            this.usersPointsArrays = null;
            this.pointsInfo = null;
            this.totalPoints = null;
            this.isLoading = false;
        },
    },
    methods: {
        async findPoints(e): Promise<void> {
            this.isLoading = true;
            const res: any = await this.$http.executeGet(`/beatmaps/${this.beatmap.id}/findPoints`, e);

            if (!this.$http.isError(res)) {
                this.tasksPointsArray = res.tasksPointsArray;
                this.usersPointsArrays = res.usersPointsArrays;
                this.pointsInfo = res.pointsInfo;
                this.totalPoints = res.totalPoints;
            }

            this.isLoading = false;
        },
    },
});
</script>
