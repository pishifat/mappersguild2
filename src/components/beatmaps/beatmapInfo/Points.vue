<template>
    <div>
        <div class="row">
            <div class="col-sm-12">
                <button
                    v-if="!sources && !beatmap.invalidForPoints"
                    v-bs-tooltip="'calculate points for all difficulties'"
                    class="btn btn-sm btn-outline-info ms-1"
                    @click="findPoints($event)"
                >
                    Calculate points
                </button>
                <div v-if="beatmap.invalidForPoints" class="small text-danger">
                    This beatmap is ineligible for points
                    <span v-if="beatmap.invalidReason"> for the following reason: <i>{{ beatmap.invalidReason }}</i></span>
                </div>
                <div v-if="isLoading" class="small text-secondary ms-2">
                    calculating...
                </div>
                <div v-else-if="pointsInfo" class="small text-secondary ms-2">
                    {{ pointsInfo }}
                </div>
            </div>
            <div v-if="sources" class="col-sm-6">
                <ul class="small text-secondary">
                    <li v-for="(source, i) in sources" :key="i">
                        {{ source.name }}: {{ source.points }}
                    </li>
                </ul>
            </div>
            <div v-if="usersPoints" class="col-sm-6">
                <ul class="small text-secondary">
                    <li v-for="user in usersPoints" :key="user.username">
                        <span v-bs-tooltip="user.sources.join(', ')">{{ user.username }}: {{ user.points }}</span>
                    </li>
                </ul>
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
            sources: null as { name: string; points: number }[] | null,
            usersPoints: null as { username: string; points: number; sources: string[] }[] | null,
            pointsInfo: null as string | null,
            isLoading: false,
        };
    },
    watch: {
        beatmap (): void {
            this.sources = null;
            this.usersPoints = null;
            this.pointsInfo = null;
            this.isLoading = false;
        },
    },
    methods: {
        async findPoints(e): Promise<void> {
            this.isLoading = true;
            const res: any = await this.$http.executeGet(`/beatmaps/${this.beatmap.id}/findPoints`, e);

            if (!this.$http.isError(res)) {
                this.sources = res.sources;
                this.usersPoints = res.usersPoints;
                this.pointsInfo = res.pointsInfo;
            }

            this.isLoading = false;
        },
    },
});
</script>
