<template>
    <div id="editBeatmap" class="modal fade" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content bg-dark" v-if="beatmap">
                <div class="modal-header text-dark" :class="'bg-' + beatmap.status.toLowerCase()">
                    <h5 class="modal-title">
                        {{ beatmap.song.artist }} - {{ beatmap.song.title }} ({{ beatmap.host.username }})
                        <i v-if="beatmap.mode == 'taiko'" class="fas fa-drum"></i>
                        <i v-else-if="beatmap.mode == 'catch'" class="fas fa-apple-alt"></i>
                        <i v-else-if="beatmap.mode == 'mania'" class="fas fa-stream"></i>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden;">
                    <img src="../../images/the_A.png" class="the-a-background" />
                    <div class="container">
                        <div class="row">
                            <!-- LEFT SIDE -->
                            <div class="col-sm-7">
                                <!-- host options -->
                                <div class="row mb-3" v-if="isHost">
                                    <div class="col">
                                        <div id="mode" class="form-group" v-if="beatmap.status == 'WIP'">
                                            <div class="d-inline-block mr-2">
                                                Mode
                                            </div>
                                            <button
                                                class="btn btn-sm btn-info rounded-100"
                                                :disabled="beatmap.mode == 'osu'"
                                                @click="setMode(beatmap.id, 'osu', $event)"
                                                data-toggle="tooltip"
                                                data-placement="top"
                                                title="osu!"
                                            >
                                                <i class="far fa-circle"></i>
                                            </button>
                                            <button
                                                class="btn btn-sm btn-info rounded-100"
                                                :disabled="beatmap.mode == 'taiko'"
                                                @click="setMode(beatmap.id, 'taiko', $event)"
                                                data-toggle="tooltip"
                                                data-placement="top"
                                                title="osu!taiko"
                                            >
                                                <i class="fas fa-drum"></i>
                                            </button>
                                            <button
                                                class="btn btn-sm btn-info rounded-100"
                                                :disabled="beatmap.mode == 'catch'"
                                                @click="setMode(beatmap.id, 'catch', $event)"
                                                data-toggle="tooltip"
                                                data-placement="top"
                                                title="osu!catch"
                                            >
                                                <i class="fas fa-apple-alt"></i>
                                            </button>
                                            <button
                                                class="btn btn-sm btn-info rounded-100"
                                                :disabled="beatmap.mode == 'mania'"
                                                @click="setMode(beatmap.id, 'mania', $event)"
                                                data-toggle="tooltip"
                                                data-placement="top"
                                                title="osu!mania"
                                            >
                                                <i class="fas fa-stream"></i>
                                            </button>
                                            <button
                                                class="btn btn-sm btn-info rounded-pill"
                                                :disabled="beatmap.mode == 'hybrid'"
                                                @click="setMode(beatmap.id, 'hybrid', $event)"
                                                data-toggle="tooltip"
                                                data-placement="top"
                                                title="multiple modes"
                                            >
                                                hybrid
                                            </button>
                                        </div>
                                        
                                        <div class="form-group" v-if="beatmap.status != 'Qualified'" id="mapsetStatus">
                                            <div class="d-inline-block mr-2">
                                                Status
                                            </div>
                                            <button
                                                class="btn btn-sm btn-outline-success"
                                                :disabled="beatmap.status == 'Done'"
                                                @click="setStatus('Done', $event)"
                                                data-toggle="tooltip"
                                                data-placement="bottom"
                                                title="mark mapset and all diffs as done"
                                            >
                                                Done
                                            </button>
                                            <button
                                                class="btn btn-sm btn-outline-warning"
                                                :disabled="beatmap.status == 'WIP'"
                                                @click="setStatus('WIP', $event)"
                                                data-toggle="tooltip"
                                                data-placement="bottom"
                                                title="mark mapset as work-in-progress"
                                            >
                                                WIP
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- difficulties -->
                                <div class="row">
                                    <div class="col">
                                        <table class="table table-sm table-dark table-hover">
                                            <thead>
                                                <td scope="col">Difficulty</td>
                                                <td scope="col">Mapper(s)</td>
                                                <td scope="col" v-if="beatmap.status != 'Ranked'">Status</td>
                                                <td scope="col" v-if="beatmap.status != 'Ranked'"></td>
                                            </thead>
                                            <transition-group tag="tbody" name="list" id="difficulties">
                                                <tr
                                                    v-for="task in beatmap.tasks"
                                                    :key="task.id"
                                                    :id="task.id + 'Row'"
                                                >
                                                    <td scope="row">
                                                        {{ task.name }}
                                                        <i 
                                                            v-if="task.mode == 'taiko'" 
                                                            class="fas fa-drum"
                                                        ></i>
                                                        <i
                                                            v-else-if="task.mode == 'catch'"
                                                            class="fas fa-apple-alt"
                                                        ></i>
                                                        <i 
                                                            v-else-if="task.mode == 'mania'" 
                                                            class="fas fa-stream"
                                                        ></i>
                                                    </td>
                                                    <td scope="row">
                                                        <template v-for="(mapper, i) in task.mappers">
                                                            <a
                                                                :href="'https://osu.ppy.sh/users/' + mapper.osuId"
                                                                target="_blank"
                                                                :key="mapper.id"
                                                                >{{
                                                                    mapper.username +
                                                                        (i < task.mappers.length - 1 ? ', ' : '')
                                                                }}</a
                                                            >
                                                        </template>
                                                        <a
                                                            href="#"
                                                            v-if="isOwner(task.mappers)"
                                                            :id="task.id + 'Collab'"
                                                            :class="[
                                                                task.status == 'Done' ||
                                                                beatmap.status == 'Done' ||
                                                                beatmap.status == 'Qualified'
                                                                    ? 'fake-button-disable'
                                                                    : '',
                                                                addCollabInput == task.id
                                                                    ? 'fake-collab-button-disable'
                                                                    : '',
                                                            ]"
                                                            class="text-success"
                                                            @click.prevent="
                                                                addCollabInput == task.id
                                                                    ? cancelCollab()
                                                                    : setCollab(task)
                                                            "
                                                            data-toggle="tooltip"
                                                            data-placement="top"
                                                            title="invite new collaborator"
                                                        >
                                                            <i class="fas fa-plus"></i>
                                                        </a>
                                                        <a
                                                            href="#"
                                                            v-if="isOwner(task.mappers) && task.mappers.length > 1"
                                                            class="text-danger"
                                                            :class="[
                                                                task.status == 'Done' ||
                                                                beatmap.status == 'Done' ||
                                                                beatmap.status == 'Qualified'
                                                                    ? 'fake-button-disable'
                                                                    : '',
                                                                removeCollabInput == task.id
                                                                    ? 'fake-collab-button-disable'
                                                                    : '',
                                                            ]"
                                                            @click.prevent="
                                                                removeCollabInput == task.id
                                                                    ? cancelCollab()
                                                                    : unsetCollab(task)
                                                            "
                                                            data-toggle="tooltip"
                                                            data-placement="top"
                                                            title="remove collaborator"
                                                        >
                                                            <i class="fas fa-minus"></i>
                                                        </a>
                                                    </td>
                                                    <td
                                                        scope="row"
                                                        :class="task.status.toLowerCase()"
                                                        v-if="beatmap.status != 'Ranked'"
                                                    >
                                                        {{ task.status }}
                                                    </td>
                                                    <td scope="row" v-if="beatmap.status != 'Ranked'">
                                                        <a
                                                            href="#"
                                                            v-if="isOwner(task.mappers) || isHost"
                                                            class="text-danger"
                                                            :class="
                                                                fakeButton == task.id ? 'fake-button-disable' : ''
                                                            "
                                                            @click.prevent="removeTask(task.id)"
                                                            data-toggle="tooltip"
                                                            data-placement="top"
                                                            title="delete"
                                                        >
                                                            <i class="fas fa-minus"></i>
                                                        </a>
                                                        <span
                                                            data-toggle="tooltip"
                                                            data-placement="top"
                                                            title="set status"
                                                        >
                                                            <a
                                                                href="#"
                                                                v-if="
                                                                    (isOwner(task.mappers) || isHost) &&
                                                                        task.status == 'WIP'
                                                                "
                                                                :class="
                                                                    fakeButton == task.id ? 'fake-button-disable' : ''
                                                                "
                                                                class="text-success"
                                                                @click.prevent="setTaskStatus(task.id, 'Done')"
                                                            >
                                                                <i class="fas fa-check"></i>
                                                            </a>
                                                            <a
                                                                href="#"
                                                                v-if="
                                                                    (isOwner(task.mappers) || isHost) &&
                                                                        task.status == 'Done'
                                                                "
                                                                :class="
                                                                    beatmap.status == 'Done' ||
                                                                    beatmap.status == 'Qualified' ||
                                                                    fakeButton == task.id
                                                                        ? 'fake-button-disable'
                                                                        : ''
                                                                "
                                                                class="icon-wip"
                                                                @click.prevent="setTaskStatus(task.id, 'WIP')"
                                                            >
                                                                <i class="fas fa-ellipsis-h"></i>
                                                            </a>
                                                        </span>
                                                    </td>
                                                </tr>
                                            </transition-group>
                                        </table>
                                    </div>
                                </div>

                                <div
                                    id="newDifficulty"
                                    v-if="beatmap.status == 'WIP'"
                                    class="row mt-2"
                                    :class="
                                        beatmap.tasksLocked.length == 6 && !isHost
                                            ? 'fake-button-disable'
                                            : ''
                                    "
                                >
                                    <div class="col form-inline">
                                        <div class="input-group input-group-sm">
                                            <select class="form-control" id="diffSelection">
                                                <option
                                                    v-if="beatmap.tasksLocked.indexOf('Easy') < 0 || isHost"
                                                    value="Easy"
                                                    >Easy</option
                                                >
                                                <option
                                                    v-if="beatmap.tasksLocked.indexOf('Normal') < 0 || isHost"
                                                    value="Normal"
                                                    >Normal</option
                                                >
                                                <option
                                                    v-if="beatmap.tasksLocked.indexOf('Hard') < 0 || isHost"
                                                    value="Hard"
                                                    >Hard</option
                                                >
                                                <option
                                                    v-if="beatmap.tasksLocked.indexOf('Insane') < 0 || isHost"
                                                    value="Insane"
                                                    >Insane</option
                                                >
                                                <option
                                                    v-if="beatmap.tasksLocked.indexOf('Expert') < 0 || isHost"
                                                    value="Expert"
                                                    >Expert</option
                                                >
                                                <option
                                                    v-if="beatmap.tasksLocked.indexOf('Storyboard') < 0 || isHost"
                                                    value="Storyboard"
                                                    >Storyboard</option
                                                >
                                            </select>
                                            <select
                                                v-if="beatmap.mode == 'hybrid'"
                                                class="form-control"
                                                id="diffModeSelection"
                                            >
                                                <option value="osu">osu!</option>
                                                <option value="taiko">osu!taiko</option>
                                                <option value="catch">osu!catch</option>
                                                <option value="mania">osu!mania</option>
                                            </select>
                                            <input
                                                v-if="isHost"
                                                class="form-control w-25"
                                                type="text"
                                                placeholder="request to... (if needed)"
                                                id="requestEntry"
                                                maxlength="18"
                                                v-model="requestTaskUsername"
                                                @keyup.enter="requestTask(beatmap.id, $event)"
                                            />
                                            <button
                                                class="btn btn-sm btn-outline-info ml-1"
                                                id="addTask"
                                                @click="addTask(beatmap.id, $event)"
                                                data-toggle="tooltip"
                                                data-placement="top"
                                                title="add difficulty"
                                                :disabled="requestDiffInput"
                                            >
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div id="newCollaborator" class="row mt-2">
                                    <div class="col">
                                        <div v-if="addCollabInput" class="input-group input-group-sm">
                                            <input
                                                class="form-control form-control-sm"
                                                type="text"
                                                placeholder="username..."
                                                id="collabMapperToAdd"
                                                @keyup.enter="addCollab($event)"
                                            />
                                            <div class="input-group-append">
                                                <button
                                                    class="btn btn-outline-info"
                                                    @click="addCollab($event)"
                                                >
                                                    Invite to {{ collabTask.name }}
                                                </button>
                                            </div>
                                        </div>
                                        <div v-if="removeCollabInput" class="input-group input-group-sm">
                                            <input
                                                class="form-control form-control-sm"
                                                type="text"
                                                placeholder="username..."
                                                id="collabMapperToRemove"
                                                @keyup.enter="removeCollab($event)"
                                            />
                                            <div class="input-group-append">
                                                <button
                                                    class="btn btn-outline-danger"
                                                    @click="removeCollab($event)"
                                                >
                                                    Remove from {{ collabTask.name }}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- RIGHT SIDE -->
                            <div class="col-sm-5 bm-col-separator-left">
                                <!-- quest -->
                                <div class="row mb-2" v-if="beatmap.status != 'Ranked' || beatmap.quest">
                                    <div class="col">
                                        <div>
                                            Quest
                                            <small
                                                class="ml-1"
                                                data-toggle="tooltip"
                                                data-placement="right"
                                                title="connect mapset to your current quest"
                                                v-if="isHost && beatmap.status != 'Ranked'"
                                            >
                                                <a
                                                    href="#"
                                                    v-if="!beatmap.quest"
                                                    id="editQuest"
                                                    :class="
                                                        fakeButton == beatmap.id + 'quest'
                                                            ? 'fake-button-disable'
                                                            : ''
                                                    "
                                                    class="text-success"
                                                    @click.prevent="setQuest()"
                                                >
                                                    <i class="fas fa-plus"></i>
                                                </a>
                                                <a
                                                    href="#"
                                                    v-if="beatmap.quest"
                                                    id="editQuest"
                                                    :class="
                                                        fakeButton == beatmap.id + 'quest'
                                                            ? 'fake-button-disable'
                                                            : ''
                                                    "
                                                    class="text-danger"
                                                    @click.prevent="unsetQuest()"
                                                >
                                                    <i class="fas fa-minus"></i>
                                                </a>
                                            </small>
                                        </div>
                                        <div class="small ml-3">
                                            <span v-if="beatmap.quest">{{ beatmap.quest.name }}</span>
                                            <i v-else>none</i>
                                        </div>
                                    </div>
                                </div>

                                <!-- modders -->
                                <div id="modders" class="row mb-2">
                                    <div class="col">
                                        <div>
                                            Modders ({{ beatmap.modders.length }}) 
                                            <small
                                                class="ml-1"
                                                data-toggle="tooltip"
                                                data-placement="right"
                                                title="add/remove yourself from modder list"
                                                v-if="beatmap.status != 'Ranked'"
                                            >
                                                <a
                                                    href="#"
                                                    v-if="isModder && !isHost"
                                                    class="mod-button text-danger"
                                                    :class="
                                                        fakeButton == beatmap.id + 'mod' ? 'fake-button-disable' : ''
                                                    "
                                                    @click.stop.prevent="updateModder()"
                                                >
                                                    <i class="fas fa-minus"></i>
                                                </a>
                                                <a
                                                    href="#"
                                                    v-if="!isModder && !isHost"
                                                    class="text-success mod-button"
                                                    :class="
                                                        fakeButton == beatmap.id + 'mod' ? 'fake-button-disable' : ''
                                                    "
                                                    @click.stop.prevent="updateModder()"
                                                >
                                                    <i class="fas fa-plus"></i>
                                                </a>
                                            </small>
                                        </div>
                                        <div class="small ml-3">
                                            <i v-if="beatmap.modders.length == 0">
                                                none
                                            </i>
                                            <span v-else>
                                                <template v-for="(modder, i) in beatmap.modders">
                                                    <a
                                                        :href="'https://osu.ppy.sh/users/' + modder.osuId"
                                                        target="_blank"
                                                        :key="modder.id"
                                                    >
                                                            {{ modder.username + (i < beatmap.modders.length - 1 ? ', ' : '') }}
                                                    </a>
                                                </template>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- bns -->
                                <div id="bns" class="row mb-2" v-if="beatmap.status != 'Ranked' || beatmap.bns">
                                    <div class="col">
                                        <div>
                                            Potential Nominators ({{ beatmap.bns.length }})
                                            <small
                                                class="ml-1"
                                                data-toggle="tooltip"
                                                data-placement="right"
                                                title="add/remove yourself from potential BN list"
                                                v-if="!isHost && beatmap.status != 'Ranked'"
                                            >
                                                <a
                                                    href="#"
                                                    v-if="isBn"
                                                    class="text-danger"
                                                    :class="
                                                        fakeButton == beatmap.id + 'bn' ? 'fake-button-disable' : ''
                                                    "
                                                    @click.prevent="updateBn()"
                                                >
                                                    <i class="fas fa-minus"></i>
                                                </a>
                                                <a
                                                    href="#"
                                                    v-if="!isBn && beatmap.bns.length < 2"
                                                    :class="
                                                        fakeButton == beatmap.id + 'bn' ? 'fake-button-disable' : ''
                                                    "
                                                    class="text-success"
                                                    @click.prevent="updateBn()"
                                                >
                                                    <i class="fas fa-plus"></i>
                                                </a>
                                            </small>
                                        </div>
                                        <div class="small ml-3">
                                            <i v-if="beatmap.bns.length == 0">none</i>
                                            <span v-else>
                                                <template v-for="(bn, i) in beatmap.bns">
                                                    <a
                                                        :href="'https://osu.ppy.sh/users/' + bn.osuId"
                                                        target="_blank"
                                                        :key="bn.id"
                                                        >{{
                                                            bn.username + (i < beatmap.bns.length - 1 ? ', ' : '')
                                                        }}</a
                                                    >
                                                </template>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- link -->
                                <div id="mapLink" class="row mb-2">
                                    <div class="col">
                                        <div>
                                            Link
                                            <a
                                                v-if="isHost"
                                                href="#"
                                                id="editLink"
                                                :class="editLinkInput ? 'text-danger' : ''"
                                                class="text-success small ml-1"
                                                @click.prevent="editLinkInput ? unsetLink() : setLink()"
                                                data-toggle="tooltip"
                                                data-placement="right"
                                                title="edit link"
                                            >
                                                <i class="fas fa-edit"></i>
                                            </a>
                                        </div>
                                        <div class="small ml-3">
                                            <a v-if="beatmap.url" :href="beatmap.url" target="_blank">
                                                <b>{{ shortUrl }}</b>
                                            </a>
                                            <i v-else>none</i>
                                        </div>
                                    </div>
                                </div>
                                <div class="row" id="linkInput" v-if="editLinkInput">
                                    <div class="col">
                                        <div class="input-group input-group-sm">
                                            <input
                                                class="form-control form-control-sm"
                                                type="text"
                                                placeholder="URL"
                                                id="newLink"
                                                @keyup.enter="saveLink($event)"
                                            />
                                            <div class="input-group-append">
                                                <button
                                                    class="btn btn-outline-info"
                                                    type="submit"
                                                    id="addLinkButton"
                                                    @click="saveLink($event)"
                                                    data-toggle="tooltip"
                                                    data-placement="right"
                                                    title="use new osu!web link for card image"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- locks -->
                                <div id="locks" class="row mb-1" v-if="beatmap.status == 'WIP'">
                                    <div class="col">
                                        <div>
                                            Locks
                                        </div>
                                        <div class="small ml-3">
                                            <i v-if="beatmap.tasksLocked.length == 0">none</i>
                                            <div v-else id="lockedDiffs">
                                                <div
                                                    v-for="task in beatmap.tasksLocked"
                                                    :key="task.id"
                                                >
                                                    <a
                                                        href="#"
                                                        v-if="isHost"
                                                        class="text-danger"
                                                        @click.prevent="unlockTask(task)"
                                                        :class="fakeButton == task ? 'fake-button-disable' : ''"
                                                        data-toggle="tooltip"
                                                        data-placement="left"
                                                        title="unlock"
                                                    >
                                                        <i class="fas fa-minus"></i>
                                                    </a>
                                                    {{ task }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="newLock" class="row" v-if="beatmap.tasksLocked.length != 6 && isHost">
                                    <div class="col">
                                        <div class="input-group input-group-sm">
                                            <select class="form-control" id="lockDiffSelection">
                                                <option
                                                    v-if="beatmap.tasksLocked.indexOf('Easy') < 0"
                                                    value="Easy"
                                                    >Easy</option
                                                >
                                                <option
                                                    v-if="beatmap.tasksLocked.indexOf('Normal') < 0"
                                                    value="Normal"
                                                    >Normal</option
                                                >
                                                <option
                                                    v-if="beatmap.tasksLocked.indexOf('Hard') < 0"
                                                    value="Hard"
                                                    >Hard</option
                                                >
                                                <option
                                                    v-if="beatmap.tasksLocked.indexOf('Insane') < 0"
                                                    value="Insane"
                                                    >Insane</option
                                                >
                                                <option
                                                    v-if="beatmap.tasksLocked.indexOf('Expert') < 0"
                                                    value="Expert"
                                                    >Expert</option
                                                >
                                                <option
                                                    v-if="beatmap.tasksLocked.indexOf('Storyboard') < 0"
                                                    value="Storyboard"
                                                    >Storyboard</option
                                                >
                                            </select>
                                            <div class="input-group-append">
                                                <button
                                                    class="btn btn-outline-info"
                                                    id="lockTask"
                                                    @click="lockTask($event)"
                                                    data-toggle="tooltip"
                                                    data-placement="right"
                                                    title="prevent other mappers from claiming a difficulty"
                                                >
                                                    <i class="fas fa-lock"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <span id="errors" class="mr-auto" :class="inviteConfirm ? 'confirm' : 'errors'">
                        {{ info }} {{ inviteConfirm }}
                    </span>
                    Created: {{ beatmap.createdAt.slice(0, 10) }}
                    <button
                        v-if="isHost"
                        id="deleteButton"
                        class="btn btn-sm btn-outline-danger ml-2"
                        @click="deleteMap($event)"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import mixin from '../../mixins.js';

export default {
    name: 'beatmap-info',
    props: ['userOsuId', 'beatmap', 'visible'],
    mixins: [mixin],
    watch: {
        beatmap: function() {
            this.info = null;
            this.addCollabInput = null;
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
        shortUrl: function() {
            if (this.beatmap.url.length > 40) {
                return this.beatmap.url.slice(0, 40) + '...';
            } else {
                return this.beatmap.url;
            }
        },
    },
    methods: {
        executePost: async function(path, data, e) {
            if (e) e.target.disabled = true;
            $("[data-toggle='tooltip']").tooltip('hide');

            try {
                const res = await axios.post(path, data);
                if (res.data.error) {
                    this.info = res.data.error;
                    this.inviteConfirm = null;
                } else {
                    if (e) e.target.disabled = false;
                    return res.data;
                }
            } catch (error) {
                this.info = 'Something went wrong';
            }
            if (e) e.target.disabled = false;
        },
        sortDiffs: function() {
            let sortOrder = ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'];
            this.beatmap.tasks.sort(function(a, b) {
                return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
            });
        },
        isOwner(mappers) {
            let value;
            mappers.forEach(mapper => {
                if (mapper.osuId == this.userOsuId) {
                    value = true;
                    return;
                }
            });
            return value;
        },

        //real methods

        //mode
        setMode: async function(id, mode, e) {
            const bm = await this.executePost('/beatmaps/setMode/' + id, { mode: mode }, e);
            if (bm) {
                this.$emit('update-map', bm);
            }
        },

        //host
        transferHost: async function(id, e) {
            const user = $('#hostEntry').val();
            const bm = await this.executePost('/beatmaps/transferHost/' + id, { user: user }, e);
            if (bm) {
                this.info = null;
                this.inviteConfirm = 'Transfer host invite sent!';
            }
        },

        //difficulties
        setCollab(task) {
            this.addCollabInput = task._id;
            this.removeCollabInput = null;
            this.requestDiffInput = null;
            this.collabTask = task;
        },
        unsetCollab(task) {
            this.removeCollabInput = task._id;
            this.addCollabInput = null;
            this.requestDiffInput = null;
            this.collabTask = task;
        },
        cancelCollab() {
            this.removeCollabInput = null;
            this.addCollabInput = null;
        },
        removeTask: async function(id) {
            this.fakeButton = id;
            this.addCollabInput = null;
            this.removeCollabInput = null;
            const bm = await this.executePost('/beatmaps/removeTask/' + id, {
                beatmapId: this.beatmap._id,
            });
            if (bm) {
                this.$emit('update-map', bm);
            }
            this.fakeButton = null;
        },
        setTaskStatus: async function(id, status) {
            this.fakeButton = id;
            this.addCollabInput = null;
            this.removeCollabInput = null;
            const bm = await this.executePost('/beatmaps/setTaskStatus/' + id, { status: status });
            if (bm) {
                this.$emit('update-map', bm);
            }
            this.fakeButton = null;
        },
        addTask: async function(id, e) {
            if (this.requestTaskUsername.length) {
                this.requestTask(id, e);
                return;
            }
            let difficulty = $('#diffSelection').val();
            let mode = $('#diffModeSelection').val();
            const bm = await this.executePost(
                '/beatmaps/addTask/' + id,
                { difficulty: difficulty, mode: mode },
                e
            );
            if (bm) {
                this.$emit('update-map', bm);
            }
        },
        setRequest() {
            this.requestDiffInput = true;
            this.addCollabInput = null;
            this.removeCollabInput = null;
        },
        unsetRequest() {
            this.requestDiffInput = null;
            this.addCollabInput = null;
            this.removeCollabInput = null;
        },
        requestTask: async function(id, e) {
            let difficulty = $('#diffSelection').val();
            let recipient = $('#requestEntry').val();
            let mode = $('#diffModeSelection').val();
            if (!mode) {
                mode = this.beatmap.mode;
            }
            const bm = await this.executePost(
                '/beatmaps/requestTask/' + id,
                { difficulty: difficulty, user: recipient, mode: mode },
                e
            );
            if (bm) {
                this.$emit('update-map', bm);
                this.info = null;
                this.inviteConfirm = 'Difficulty request sent!';
            }
        },
        addCollab: async function(e) {
            const user = $('#collabMapperToAdd').val();
            const id = this.addCollabInput;
            const bm = await this.executePost('/beatmaps/task/' + id + '/addCollab', { user: user }, e);
            if (bm) {
                this.$emit('update-map', bm);
                this.info = null;
                this.inviteConfirm = 'Collab invite sent!';
                this.addCollabInput = null;
            }
        },
        removeCollab: async function(e) {
            const user = $('#collabMapperToRemove').val();
            const id = this.removeCollabInput;
            const bm = await this.executePost('/beatmaps/task/' + id + '/removeCollab', { user: user }, e);
            if (bm) {
                this.$emit('update-map', bm);
                this.removeCollabInput = null;
            }
        },

        //status
        setStatus: async function(status, e) {
            const bm = await this.executePost(
                '/beatmaps/setStatus/' + this.beatmap._id,
                { status: status },
                e
            );
            if (bm) {
                this.$emit('update-map', bm);
                axios.get('/beatmaps/relevantInfo').then(response => {
                    this.$parent.allBeatmaps = response.data.beatmaps;
                    this.$parent.beatmaps = response.data.beatmaps;
                    if (this.$parent.filterValue.length > 2) {
                        this.$parent.filter();
                    }
                });
            }
        },

        //quest
        setQuest: async function() {
            this.fakeButton = this.beatmap._id + 'quest';
            const bm = await this.executePost('/beatmaps/setQuest/' + this.beatmap._id);
            if (bm) {
                if (bm.status == 'WIP') {
                    $(`#${bm.quest.name.split(' ').join('')}Wip`).collapse('show');
                    $(`.non-quest-collapse-wip`).collapse();
                } else {
                    $(`#${bm.quest.name.split(' ').join('')}Done`).collapse('show');
                    $(`.non-quest-collapse-done`).collapse();
                }
                this.$emit('update-map', bm);
                axios.get('/beatmaps/relevantInfo').then(response => {
                    this.$parent.allQuests = response.data.allQuests;
                    this.$parent.beatmaps = response.data.beatmaps;
                });
            }
            this.fakeButton = null;
        },
        unsetQuest: async function() {
            this.fakeButton = this.beatmap._id + 'quest';
            const bm = await this.executePost('/beatmaps/unsetQuest/' + this.beatmap._id);
            if (bm) {
                this.$emit('update-map', bm);
            }
            this.fakeButton = null;
            /* const questIndex = this.$parent.wipQuests.findIndex(q => q.id == bm.quest.id);
			this.$parent.wipQuests[questIndex].associatedMaps.slice();
            beatmap = bm;
            this.$parent.info = null;
            this.sortDiffs();
            this.$parent.wipQuests.fin */
            axios.get('/beatmaps/relevantInfo').then(response => {
                this.$parent.allQuests = response.data.allQuests;
                this.$parent.beatmaps = response.data.beatmaps;
            });
        },

        //mod
        updateModder: async function() {
            this.fakeButton = this.beatmap._id + 'mod';
            const bm = await this.executePost('/beatmaps/updateModder/' + this.beatmap._id);
            if (bm) {
                this.$emit('update-map', bm);
            }
            this.fakeButton = null;
        },

        //BN
        updateBn: async function() {
            this.fakeButton = this.beatmap._id + 'bn';
            const bm = await this.executePost('/beatmaps/updateBn/' + this.beatmap._id);
            if (bm) {
                this.$emit('update-map', bm);
            }
            this.fakeButton = null;
        },

        //link
        setLink() {
            this.editLinkInput = true;
        },
        unsetLink() {
            this.editLinkInput = null;
        },
        saveLink: async function(e) {
            let url = $('#newLink').val();
            const bm = await this.executePost('/beatmaps/setLink/' + this.beatmap._id, { url: url }, e);
            if (bm) {
                this.editLinkInput = null;
                this.$emit('update-map', bm);
            }
        },

        //locks
        unlockTask: async function(difficulty) {
            this.fakeButton = difficulty;
            const bm = await this.executePost('/beatmaps/unlockTask/' + this.beatmap._id, {
                difficulty: difficulty,
            });
            if (bm) {
                this.editLinkInput = null;
                this.$emit('update-map', bm);
            }
        },
        lockTask: async function(e) {
            this.fakeButton = null;
            let difficulty = $('#lockDiffSelection').val();
            const bm = await this.executePost(
                '/beatmaps/lockTask/' + this.beatmap._id,
                { difficulty: difficulty },
                e
            );
            if (bm) {
                this.$emit('update-map', bm);
            }
        },

        //delete
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
            inviteConfirm: null,
            addCollabInput: null,
            removeCollabInput: null,
            editLinkInput: null,
            requestDiffInput: null,
            collabTask: null,
            fakeButton: null,
            info: null,

            requestTaskUsername: '',
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
