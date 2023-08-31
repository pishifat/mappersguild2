<template>
    <div>
        <div class="row">
            <div class="col-sm-12">
                <button
                    v-if="!tasksPointsArray"
                    v-bs-tooltip="'calculate points for all difficulties'"
                    class="btn btn-sm btn-outline-info ms-1"
                    @click="findPoints($event)"
                >
                    Calculate points
                </button>
                <div v-if="isLoading" class="small text-secondary ms-2">
                    calculating...
                </div>
                <div v-else-if="pointsInfo" class="small text-secondary ms-2">
                    {{ pointsInfo }}
                </div>
            </div>
            <div v-if="tasksPointsArray" class="col-sm-6">
                <ul class="small text-secondary">
                    <li v-for="(value, i) in tasksPointsArray" :key="i">
                        {{ value }}
                    </li>
                    <li>BN mod/nomination: {{ bnPoints }}</li>
                    <li>Map host: 5</li>
                </ul>
            </div>
            <div class="col-sm-6">
                <ul v-if="usersPointsArrays" class="small text-secondary">
                    <li v-for="(value, i) in usersPointsArrays" :key="i">
                        {{ usersPointsArrays[i][0] }}: {{ usersPointsArrays[i][0] == beatmap.host.username ? usersPointsArrays[i][1] + 5 : usersPointsArrays[i][1] }}
                    </li>
                </ul>
            </div>
            <div v-if="totalPoints" class="col-sm-12">
                <span class="small text-secondary ms-2">
                    total: {{ Math.round(totalPoints*10)/10 + 5 }}
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
            bnPoints: null,
            isLoading: false,
        };
    },
    watch: {
        beatmap (): void {
            this.tasksPointsArray = null;
            this.usersPointsArrays = null;
            this.pointsInfo = null;
            this.totalPoints = null;
            this.bnPoints = null;
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
                this.bnPoints = res.bnPoints;
            }

            this.isLoading = false;
        },
    },
});
</script>
