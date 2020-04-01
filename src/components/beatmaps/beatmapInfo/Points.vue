<template>
    <div>
        <div class="row my-3">
            <div class="col">
                <div>
                    Points
                    <button
                        v-if="!pointsArray"
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
                <ul v-if="pointsArray" class="small text-white-50" style="list-style-type: disc">
                    <li v-for="(value, i) in pointsArray" :key="i">
                        {{ value }}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Beatmap } from '../../../../interfaces/beatmap/beatmap';

export default Vue.extend({
    name: 'QuestChoice',
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    data () {
        return {
            pointsArray: null,
            pointsInfo: null,
            isLoading: false,
        };
    },
    watch: {
        beatmap (): void {
            this.pointsArray = null;
            this.pointsInfo = null;
            this.isLoading = false;
        },
    },
    methods: {
        async findPoints(e): Promise<void> {
            this.isLoading = true;
            const res: any = await this.executeGet(`/beatmaps/${this.beatmap.id}/findPoints`, e);

            if (!this.isError(res)) {
                this.pointsArray = res.pointsArray;
                this.pointsInfo = res.pointsInfo;
                this.isLoading = false;
            }
        },
    },
});
</script>
