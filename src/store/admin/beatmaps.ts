import Vue from 'vue';
import { StoreOptions } from 'vuex';
import { Beatmap } from '../../../interfaces/beatmap/beatmap';

interface BeatmapState {
    beatmaps: Beatmap[];
}

const store: StoreOptions<BeatmapState> = {
    state: {
        beatmaps: [],
    },
    mutations: {
        setBeatmaps (state, beatmaps: Beatmap[]): void {
            state.beatmaps = beatmaps;
        },
        updateBeatmapStatus (state, payload): void {
            const beatmap = state.beatmaps.find(b => b.id == payload.beatmapId);

            if (beatmap) {
                beatmap.status = payload.status;
            }
        },
        deleteTask (state, payload): void {
            const beatmap = state.beatmaps.find(b => b.id == payload.beatmapId);

            if (beatmap) {
                const i = beatmap.tasks.findIndex(t => t.id == payload.taskId);

                if (i !== -1) {
                    beatmap.tasks.splice(i, 1);
                }
            }
        },
        deleteModder (state, payload): void {
            const beatmap = state.beatmaps.find(b => b.id == payload.beatmapId);

            if (beatmap) {
                const i = beatmap.modders.findIndex(m => m.id == payload.modderId);

                if (i !== -1) {
                    beatmap.modders.splice(i, 1);
                }
            }
        },
        updateUrl (state, payload): void {
            const beatmap = state.beatmaps.find(b => b.id == payload.beatmapId);

            if (beatmap) {
                beatmap.url = payload.url;
            }
        },
        updateStoryboardQuality (state, payload): void {
            const beatmap = state.beatmaps.find(b => b.id == payload.beatmapId);

            if (beatmap) {
                const i = beatmap.tasks.findIndex(t => t.id == payload.taskId);

                if (i !== -1)  Vue.set(beatmap.tasks, i, payload.task);
            }
        },
        updatePackId (state, payload): void {
            const beatmap = state.beatmaps.find(b => b.id == payload.beatmapId);

            if (beatmap) {
                beatmap.packId = payload.packId;
            }
        },
        updateIsShowcase (state, payload): void {
            const beatmap = state.beatmaps.find(b => b.id == payload.beatmapId);

            if (beatmap) {
                beatmap.isShowcase = payload.isShowcase;
            }
        },
    },
};

export default store;
