<template>
    <div>
        <div v-if="osuBeatmaps" class="container card card-body py-3 my-3">
            <h4>osu!</h4>
            <transition-group name="list" tag="div" class="row">
                <beatmap-card
                    v-for="beatmap in osuBeatmaps"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                    @update:selectedBeatmap="setSelectedBeatmap($event)"
                />
            </transition-group>
            <p v-if="!osuBeatmaps.length" class="ms-5 text-secondary">
                None...
            </p>

            <div class="mt-2">
                <h5>notes</h5>
                <textarea
                    v-model="osuNote"
                    class="ml-1 form-control form-control-sm"
                    placeholder="click outside the box to save..."
                    maxlength="40000"
                    rows="3"
                    @change="updateNote('osu', osuNote, $event)"
                />
            </div>
        </div>

        <div v-if="taikoBeatmaps" class="container card card-body py-3 my-3">
            <h4>osu!taiko</h4>
            <transition-group name="list" tag="div" class="row">
                <beatmap-card
                    v-for="beatmap in taikoBeatmaps"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                    @update:selectedBeatmap="setSelectedBeatmap($event)"
                />
            </transition-group>
            <p v-if="!taikoBeatmaps.length" class="ms-5 text-secondary">
                None...
            </p>

            <div class="mt-2">
                <h5>notes</h5>
                <textarea
                    v-model="taikoNote"
                    class="ml-1 form-control form-control-sm"
                    placeholder="click outside the box to save..."
                    maxlength="40000"
                    rows="3"
                    @change="updateNote('taiko', taikoNote, $event)"
                />
            </div>
        </div>

        <div v-if="catchBeatmaps" class="container card card-body py-3 my-3">
            <h4>osu!catch</h4>
            <transition-group name="list" tag="div" class="row">
                <beatmap-card
                    v-for="beatmap in catchBeatmaps"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                    @update:selectedBeatmap="setSelectedBeatmap($event)"
                />
            </transition-group>
            <p v-if="!catchBeatmaps.length" class="ms-5 text-secondary">
                None...
            </p>

            <div class="mt-2">
                <h5>notes</h5>
                <textarea
                    v-model="catchNote"
                    class="ml-1 form-control form-control-sm"
                    placeholder="click outside the box to save..."
                    maxlength="40000"
                    rows="3"
                    @change="updateNote('catch', catchNote, $event)"
                />
            </div>
        </div>

        <div v-if="maniaBeatmaps" class="container card card-body py-3 my-3">
            <h4>osu!mania</h4>
            <transition-group name="list" tag="div" class="row">
                <beatmap-card
                    v-for="beatmap in maniaBeatmaps"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                    @update:selectedBeatmap="setSelectedBeatmap($event)"
                />
            </transition-group>
            <p v-if="!maniaBeatmaps.length" class="ms-5 text-secondary">
                None...
            </p>

            <div class="mt-2">
                <h5>notes</h5>
                <textarea
                    v-model="maniaNote"
                    class="ml-1 form-control form-control-sm"
                    placeholder="click outside the box to save..."
                    maxlength="40000"
                    rows="3"
                    @change="updateNote('mania', maniaNote, $event)"
                />
            </div>
        </div>

        <edit-beatmap-modal
            v-if="selectedBeatmap"
            :selected-beatmap="selectedBeatmap"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters, mapMutations } from 'vuex';
import worldCupModule from '@store/worldCup';
import { Beatmap } from '@interfaces/beatmap/beatmap';
import { Note } from '@interfaces/note';
import BeatmapCard from '@components/beatmaps/BeatmapCard.vue';
import EditBeatmapModal from '@pages/beatmaps/EditBeatmapModal.vue';

export default defineComponent({
    name: 'WorldCupPage',
    components: {
        BeatmapCard,
        EditBeatmapModal,
    },
    data () {
        return {
            osuNote: '',
            taikoNote: '',
            catchNote: '',
            maniaNote: '',
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapState('worldCup', [
            'beatmaps',
            'selectedBeatmap',
        ]),
        ...mapGetters('worldCup', [
            'osuBeatmaps',
            'taikoBeatmaps',
            'catchBeatmaps',
            'maniaBeatmaps',
        ]),
    },
    beforeCreate () {
        if (!this.$store.hasModule('worldCup')) {
            this.$store.registerModule('worldCup', worldCupModule);
        }
    },
    async created () {
        const res = await this.$http.initialRequest<{ beatmaps: Beatmap[], notes: Note[] }>('/worldCup/query');

        if (!this.$http.isError(res)) {
            this.$store.commit('worldCup/setBeatmaps', res.beatmaps);

            for (const note of res.notes) {
                switch (note.name) {
                    case 'osu':
                        this.osuNote = note.content;
                        break;
                    case 'taiko':
                        this.taikoNote = note.content;
                        break;
                    case 'catch':
                        this.catchNote = note.content;
                        break;
                    case 'mania':
                        this.maniaNote = note.content;
                        break;
                    default:
                        break;
                }
            }
        }
    },
    methods: {
        ...mapMutations('worldCup', [
            'setSelectedBeatmap',
        ]),
        async updateNote(mode, userInput, e): Promise<void> {
            const note: any = await this.$http.executePost(`/worldCup/updateNote/${mode}`, { note: userInput }, e);

            if (!this.$http.isError(note)) {
                switch (mode) {
                    case 'osu':
                        this.osuNotes = note;
                        break;
                    case 'taiko':
                        this.taikoNotes = note;
                        break;
                    case 'catch':
                        this.catchNotes = note;
                        break;
                    case 'mania':
                        this.maniaNotes = note;
                        break;
                    default:
                        break;
                }
            }
        },
    },
});
</script>
