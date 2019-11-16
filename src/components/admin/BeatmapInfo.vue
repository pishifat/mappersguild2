<template>
    <div id="editBeatmap" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content bg-dark" v-if="beatmap">
                <div class="modal-header text-dark bg-rest">
                    <h5 class="modal-title">
                        <a v-if="beatmap.url" :href="beatmap.url" class="text-dark" target="_blank">
                            {{ beatmap.song.artist }} - {{ beatmap.song.title }}
                        </a>
                        <span v-else>{{ beatmap.song.artist }} - {{ beatmap.song.title }}</span>
                        (<a :href="'https://osu.ppy.sh/users/' + beatmap.host.osuId" class="text-dark" target="_blank">{{ beatmap.host.username }}</a>)
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden">
                    <p class="form-row">
                        <select v-model="status" class="form-control form-control-sm w-25 mx-2">
                            <option value="WIP">WIP</option>
                            <option value="Done">Done</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Ranked">Ranked</option>
                        </select>
                        <button class="btn btn-sm btn-outline-info" @click="updateBeatmapStatus($event)">
                            Save status
                        </button>
                    </p>
                    <p class="form-row">
                        <select v-model="taskId" class="form-control form-control-sm w-50 mx-2">
                            <option v-for="task in sortedTasks" :value="task.id" :key="task.id">
                                {{task.name}} --- 
                                <template v-for="(mapper, i) in task.mappers">
                                    {{ mapper.username + (i < task.mappers.length - 1 ? ', ' : '') }}
                                </template>
                            </option>
                        </select>
                        <button class="btn btn-sm btn-outline-danger" @click="deleteTask($event)">
                            Remove difficulty
                        </button>
                    </p>
                    <p class="form-row">
                        <select v-model="modderId" class="form-control form-control-sm w-50 mx-2">
                            <option v-for="modder in beatmap.modders" :value="modder.id" :key="modder.id">
                                {{modder.username}}
                            </option>
                        </select>
                        <button class="btn btn-sm btn-outline-danger" @click="deleteModder($event)">
                            Remove modder
                        </button>
                    </p>
                    <p v-if="beatmap.url" class="min-spacing small text-white-50">
                        Current URL: 
                        <a :href="beatmap.url" target="_blank">{{ beatmap.url }}</a>
                    </p>
                    <p>
                        <input
                            class="form-control-sm mx-2 w-75"
                            type="text"
                            autocomplete="off"
                            placeholder="beatmap url..."
                            v-model="beatmapUrl"
                        />
                        <button class="btn btn-sm btn-outline-info" @click="updateUrl($event)">
                            Save URL
                        </button>
                    </p>
                    <p v-if="storyboardQuality" class="form-row">
                        <select v-model="storyboardQuality" class="form-control form-control-sm w-25 mx-2">
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                        </select>
                        <button class="btn btn-sm btn-outline-info" @click="updateStoryboardQuality($event)">
                            Save Storyboard Quality
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'beatmap-info',
    props: ['beatmap'],
    watch: {
        beatmap: function() {
            this.status = this.beatmap.status;
            this.taskId = null;
            this.modderId = null;
            this.beatmapUrl = this.beatmap.url;
            this.storyboardQuality = null;
            this.beatmap.tasks.forEach(task => {
                if(task.name == 'Storyboard'){
                    this.storyboardQuality = task.sbQuality;
                }
            });
        },
    },
    computed: {
        sortedTasks: function() {
            let sortOrder = ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'];
            return this.beatmap.tasks.sort(function(a, b) {
                return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
            });
        }
    },
    methods: {
        executePost: async function(path, data, e) {
            if (e) e.target.disabled = true;

            try {
                const res = await axios.post(path, data);

                if (res.data.error) {
                    this.info = res.data.error;
                } else {
                    if (e) e.target.disabled = false;
                    return res.data;
                }
            } catch (error) {
                console.log(error);
            }

            if (e) e.target.disabled = false;
        },
        updateBeatmapStatus: async function(e) {
            const b = await this.executePost('/newadmin/updateBeatmapStatus/' + this.beatmap.id, { status: this.status }, e);
            if (b) {
                this.$emit('update-beatmap', b);
            }
        },
        deleteTask: async function(e) {
            const b = await this.executePost('/newadmin/deleteTask/' + this.beatmap.id, { taskId: this.taskId }, e);
            if (b) {
                this.$emit('update-beatmap', b);
            }
        },
        deleteModder: async function(e) {
            const b = await this.executePost('/newadmin/deleteModder/' + this.beatmap.id, { modderId: this.modderId }, e);
            if (b) {
                this.$emit('update-beatmap', b);
            }
        },
        updateUrl: async function(e) {
            const b = await this.executePost('/newadmin/updateUrl/' + this.beatmap.id, { url: this.beatmapUrl }, e);
            if (b) {
                this.$emit('update-beatmap', b);
            }
        },
        updateStoryboardQuality: async function(e) {
            const b = await this.executePost('/newadmin/updateStoryboardQuality/' + this.beatmap.id, { storyboardQuality: this.storyboardQuality }, e);
            if (b) {
                this.$emit('update-beatmap', b);
            }
        },
    },
    data() {
        return {
            status: null,
            taskId: null,
            modderId: null,
            beatmapUrl: null,
            storyboardQuality: null,
        };
    },
};
</script>