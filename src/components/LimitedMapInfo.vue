<template>
<div id="limitedEditBeatmap" class="modal fade overlay-modal my-4" tabindex="-1">
    <div class="modal-dialog modal-md">
        <div class="modal-content bg-dark" v-if="beatmap">
            <div class="modal-header text-dark" :class="'bg-' + beatmap.status.toLowerCase()">
                <h5 class="modal-title">
                    {{beatmap.song.artist}} - {{beatmap.song.title}} ({{beatmap.host.username}}) 
                    <i v-if="beatmap.mode == 'taiko'" class="fas fa-drum"></i>
                    <i v-else-if="beatmap.mode == 'catch'" class="fas fa-apple-alt"></i>
                    <i v-else-if="beatmap.mode == 'mania'" class="fas fa-stream"></i>
                </h5>
                <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
                </button>
            </div>
            <div class="modal-body" style="overflow: hidden;">
                <img src="../images/the_A.png" class="the-a-background">
                <div class="container">
                    <div class="row">
                        <div class="col-sm-12">
                            <table class="table table-sm table-dark table-hover">
                                <thead>
                                    <td scope="col">Difficulty</td>
                                    <td scope="col">Mapper(s)</td>
                                    <td scope="col" v-if="beatmap.status != 'Ranked'">Status</td>
                                </thead>
                                <transition-group tag="tbody" name="list" id="difficulties">
                                    <tr v-for="task in beatmap.tasks" :key="task.id" :id="task.id + 'Row'">
                                        <td scope="row">{{task.name}}</td>
                                        <td scope="row">
                                            <template v-for="(mapper, i) in task.mappers">
                                                <a :href="'https://osu.ppy.sh/users/' + mapper.osuId" target="_blank" :key="mapper.id">{{ mapper.username + (i < task.mappers.length - 1 ? ', ' : '') }}</a>
                                            </template>
                                        </td>
                                        <td scope="row" :class="task.status.toLowerCase()" v-if="beatmap.status != 'Ranked'">{{task.status}}</td>
                                    </tr>
                                </transition-group>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: 'limited-map-info',
    props: [ 'beatmap' ],
    watch: {
        beatmap: function () {
            this.sortTasks();
        }
    },
    methods: {
        sortTasks: function(){
            let sortOrder = ["Easy", "Normal", "Hard", "Insane", "Expert", "Storyboard"]
            this.beatmap.tasks.sort(function(a, b) {
                return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
            });
        },
    }
}
</script>

<style>

</style>
