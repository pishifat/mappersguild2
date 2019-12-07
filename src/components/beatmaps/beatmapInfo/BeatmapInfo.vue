<template>
    <div class="container">
        <div class="row">
            <!-- LEFT SIDE -->
            <div :class="(isHost && !isRanked) ? 'col-sm-7' : 'col-sm-12'">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <modders-list
                            :beatmap="beatmap"
                            :can-edit="!isHost && !isRanked"
                            @update:beatmap="$emit('update:beatmap', $event)"
                        ></modders-list>
                    </div>

                    <div id="bns" class="col-sm-6" v-if="!isRanked || beatmap.bns">
                        <nominators-list
                            :beatmap="beatmap"
                            :can-edit="!isHost && !isRanked"
                            @update:beatmap="$emit('update:beatmap', $event)"
                        ></nominators-list>
                    </div>
                </div>

                <hr>

                <div class="row">
                    <div class="col-sm">
                        <!-- tasks options -->
                        <tasks-choice
                            :is-ranked="isRanked"
                            :is-host="isHost"
                            :beatmap="beatmap"
                            @update:beatmap="$emit('update:beatmap', $event)"
                        ></tasks-choice>

                        <new-task
                            :beatmap="beatmap"
                            :is-host="isHost"
                            @update:invite-confirm="inviteConfirm = $event"
                            @update:info="info = $event"
                        ></new-task>
                    </div>
                </div>

                <div class="row mt-2">
                    <span id="errors" class="mr-auto" :class="inviteConfirm ? 'confirm' : 'errors'">
                        {{ info }} {{ inviteConfirm }}
                    </span>
                </div>
            </div>

            <!-- RIGHT SIDE -->
            <!-- host options -->
            <div class="col-sm-5 bm-col-separator-left" v-if="isHost && !isRanked">
                <div class="row mb-2">
                    <div class="col-sm">
                        <mode-choice
                            :beatmap="beatmap"
                            @update:beatmap="$emit('update:beatmap', $event)"
                        ></mode-choice>
                    </div>
                </div>

                <div class="row mb-2">
                    <div class="col-sm">
                        <status-choice
                            :beatmap="beatmap"
                            @update:beatmap="$emit('update:beatmap', $event)"
                        ></status-choice>
                    </div>
                </div>

                <quest-choice
                    :beatmap="beatmap"
                ></quest-choice>

                <beatmap-link
                    :beatmap="beatmap"
                    @update:beatmap="$emit('update:beatmap', $event)"
                ></beatmap-link>

                <locks-choice
                    v-if="beatmap.status == 'WIP'"
                    :beatmap="beatmap"
                    @update:beatmap="$emit('update:beatmap', $event)"
                ></locks-choice>
            </div>
        </div>

        <hr>

        <div class="row">
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
    props: ['userOsuId', 'beatmap', 'isTable'],
    mixins: [ mixin ],
    watch: {
        beatmap: function() {
            this.info = null;
            this.removeCollabInput = null;
            this.editLinkInput = null;
            this.requestDiffInput = null;
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
        isModder: function() {
            let value;
            this.beatmap.modders.forEach(modder => {
                if (modder.osuId == this.userOsuId) {
                    value = true;
                    return;
                }
            });
            return value;
        },
        isBn: function() {
            let value;
            this.beatmap.bns.forEach(bn => {
                if (bn.osuId == this.userOsuId) {
                    value = true;
                    return;
                }
            });
            return value;
        },
        missingTasks: function() {
            const tasks = [
                'Easy',
                'Normal',
                'Hard',
                'Insane',
                'Expert',
                'Storyboard',
            ];

            return tasks.filter(task => {
                return this.beatmap.tasks.find(t => t.name == task);
            });
        }
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
            removeCollabInput: null,
            editLinkInput: null,
            userQuests: null,
            requestDiffInput: null,
            collabTask: null,
            requestTaskUsername: '',
            dropdownQuestId: '',
            info: null,
            inviteConfirm: null,
        };
    },
};
</script>

<style>
.fake-button-disable {
    pointer-events: none;
    opacity: 0.6;
}

.fake-collab-button-disable {
    opacity: 0.6;
    color: var(--ranked);
}
</style>
