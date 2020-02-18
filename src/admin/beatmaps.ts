import Vue from 'vue';
import Vuex from 'vuex';
import BeatmapPage from '../pages/admin/BeatmapPage.vue';
import '../bootstrap';
import mixins from '../mixins';
import toastsModule from '../modules/toasts';
import { Beatmap } from '../../interfaces/beatmap/beatmap';

Vue.mixin(mixins);
Vue.use(Vuex);

interface BeatmapState {
    beatmaps: Beatmap[];
}

const store = new Vuex.Store<BeatmapState>({
    modules: {
        toasts: toastsModule,
    },
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
    },
    strict: process.env.NODE_ENV !== 'production',
});

new Vue({
    el: '#app',
    store,
    components: {
        BeatmapPage,
    },
});
