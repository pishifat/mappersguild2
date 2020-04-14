<template>
    <div>
        <div class="row">
            <div class="col-sm-12">
                <button
                    v-if="!tasksPointsArray"
                    class="btn btn-sm btn-outline-info ml-1"
                    data-toggle="tooltip"
                    data-placement="top"
                    title="calculate points for all difficulties"
                    @click="findPoints($event)"
                >
                    Calculate points
                </button>
                <span v-if="isLoading" class="small text-white-50 ml-2">
                    calculating...
                </span>
                <span v-else-if="pointsInfo" class="small text-white-50 ml-2">
                    {{ pointsInfo }}
                </span>
            </div>
            <div v-if="tasksPointsArray" class="col-sm-6">
                <ul class="small text-white-50" style="list-style-type: disc">
                    <li v-for="(value, i) in tasksPointsArray" :key="i">
                        {{ value }}
                    </li>
                </ul>
            </div>
            <div class="col-sm-6">
                <ul v-if="usersPointsArrays" class="small text-white-50" style="list-style-type: disc">
                    <li v-for="(value, i) in usersPointsArrays" :key="i">
                        {{ usersPointsArrays[i][0] }}: {{ usersPointsArrays[i][1] }}
                    </li>
                </ul>
            </div>
            <div v-if="totalPoints" class="col-sm-12">
                <span class="small text-white-50 ml-2">
                    total: {{ Math.round(totalPoints*10)/10 }}
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Beatmap } from '../../../../interfaces/beatmap/beatmap';

export default Vue.extend({
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
            const res: any = await this.executeGet(`/beatmaps/${this.beatmap.id}/findPoints`, e);

            if (!this.isError(res)) {
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
