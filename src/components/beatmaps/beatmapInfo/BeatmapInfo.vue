<template>
    <div class="container">
        <div class="row">
            <!-- LEFT SIDE -->
            <div :class="(isHost && !isRanked && !isQualifed) ? 'col-lg-7' : 'col-sm-12'">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <modders-list
                            :beatmap="beatmap"
                            :can-edit="!isHost && !isRanked"
                            :user-osu-id="userOsuId"
                            @update:beatmap="$emit('update:beatmap', $event)"
                            @update:info="info = $event"
                        ></modders-list>
                    </div>

                    <div id="bns" class="col-sm-6" v-if="!isRanked || beatmap.bns">
                        <nominators-list
                            :beatmap="beatmap"
                            :can-edit="!isHost && !isRanked"
                            :user-osu-id="userOsuId"
                            @update:beatmap="$emit('update:beatmap', $event)"
                            @update:info="info = $event"
                        ></nominators-list>
                    </div>
                </div>

                <hr>

                <div class="row">
                    <div class="col-sm">
                        <!-- tasks options -->
                        <tasks-choice
                            :is-ranked="isRanked"
                            :is-qualifed="isQualifed"
                            :is-host="isHost"
                            :user-osu-id="userOsuId"
                            :beatmap="beatmap"
                            @update:beatmap="$emit('update:beatmap', $event)"
                            @update:info="info = $event"
                        ></tasks-choice>
                    </div>
                </div>
            </div>

            <!-- RIGHT SIDE -->
            <!-- host options -->
            <div class="col-lg-5 bm-col-separator-left" v-if="isHost && !isRanked && !isQualifed">
                <div class="row mb-2">
                    <div class="col-sm">
                        <mode-choice
                            :beatmap="beatmap"
                            @update:beatmap="$emit('update:beatmap', $event)"
                            @update:info="info = $event"
                        ></mode-choice>
                    </div>
                </div>

                <div class="row mb-2">
                    <div class="col-sm">
                        <status-choice
                            :beatmap="beatmap"
                            @update:beatmap="$emit('update:beatmap', $event)"
                            @update:info="info = $event"
                        ></status-choice>
                    </div>
                </div>

                <quest-choice
                    :beatmap="beatmap"
                    @update:beatmap="$emit('update:beatmap', $event)"
                    @update:info="info = $event"
                ></quest-choice>

                <beatmap-link
                    :beatmap="beatmap"
                    @update:beatmap="$emit('update:beatmap', $event)"
                    @update:info="info = $event"
                ></beatmap-link>

                <locks-choice
                    v-if="beatmap.status == 'WIP'"
                    :beatmap="beatmap"
                    @update:beatmap="$emit('update:beatmap', $event)"
                    @update:info="info = $event"
                ></locks-choice>
            </div>
        </div>

        <hr>

        <div class="row">
            <div class="col-sm">
                <span class="errors">
                    {{ info }}
                </span>
            </div>

            <div class="col-sm text-right">
                <span class="small text-white-50">
                    Created: {{ beatmap.createdAt.slice(0, 10) }}
                </span>
                <button
                    v-if="isHost && !isRanked"
                    id="deleteButton"
                    class="btn btn-sm btn-outline-danger ml-2"
                    @click="deleteMap($event)"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import mixin from '../../../mixins.js';
import ModeChoice from './ModeChoice.vue';
import StatusChoice from './StatusChoice.vue';
import TasksChoice from './TasksChoice.vue';
import NewTask from './NewTask.vue';
import QuestChoice from './QuestChoice.vue';
import ModdersList from './ModdersList.vue';
import NominatorsList from './NominatorsList.vue';
import BeatmapLink from './BeatmapLink.vue';
import LocksChoice from './LocksChoice.vue';

export default {
    name: 'beatmap-info',
    components: {
        ModeChoice,
        StatusChoice,
        TasksChoice,
        NewTask,
        QuestChoice,
        ModdersList,
        NominatorsList,
        BeatmapLink,
        LocksChoice,
    },
    props: {
        userOsuId: Number,
        beatmap: Object,
    },
    mixins: [ mixin ],
    watch: {
        beatmap: function() {
            this.info = null;
            this.editLinkInput = null;
            this.collabTask = null;
            this.fakeButton = null;
            this.sortDiffs();
        },
    },
    computed: {
        isHost: function() {
            return this.userOsuId == this.beatmap.host.osuId;
        },
        isRanked () {
            return this.beatmap.status == 'Ranked';
        },
        isQualifed () {
            return this.beatmap.status == 'Qualified';
        },
    },
    methods: {
        sortDiffs: function() {
            let sortOrder = ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'];
            this.beatmap.tasks.sort(function(a, b) {
                return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
            });
        },
        deleteMap: async function(e) {
            const result = confirm(`Are you sure you want to delete?`);
            if (result) {
                e.target.disabled = true;
                const bm = await this.executePost('/beatmaps/delete/' + this.beatmap._id, e);
                if (bm) {
                    $('#editBeatmap').modal('hide');
                    const i = this.$parent.beatmaps.findIndex(b => b.id == bm.id);
                    this.$parent.beatmaps.splice(i, 1);
                    this.$parent.allBeatmaps.splice(i, 1);
                    e.target.disabled = false;
                }
            }
        },
    },
    data() {
        return {
            editLinkInput: null,
            userQuests: null,
            collabTask: null,
            requestTaskUsername: '',
            dropdownQuestId: '',
            info: null,
        };
    },
};
</script>

<style>
@media (min-width: 992px) {
    .bm-col-separator-left {
        border-left: 3px solid rgba(100, 88, 88, 0.42);
    }
}

.fake-button-disable {
    pointer-events: none;
    opacity: 0.6;
}
</style>
