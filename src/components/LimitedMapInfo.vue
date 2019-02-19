<template>
<div id="limitedEditBeatmap" class="modal fade my-4" tabindex="-1">
    <div class="modal-dialog modal-md">
        <div class="modal-content custom-bg-dark" v-if="beatmap">
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
                            <table class="small table text-shadow">
                                <thead>
                                    <td scope="col" style="padding: 2px;">Difficulty</td>
                                    <td scope="col" style="padding: 2px;">Mapper(s)</td>
                                    <td scope="col" style="padding: 2px;" v-if="beatmap.status != 'Ranked'">Status</td>
                                </thead>
                                <transition-group tag="tbody" name="list" id="difficulties">
                                    <tr v-for="task in beatmap.tasks" :key="task.id" :id="task.id + 'Row'">
                                        <td scope="row" style="padding: 1px;">{{task.name}}</td>
                                        <td scope="row" style="padding: 1px;">
                                            <template v-for="(mapper, i) in task.mappers">
                                                <a :href="'https://osu.ppy.sh/users/' + mapper.osuId" target="_blank" :key="mapper.id">{{ mapper.username + (i < task.mappers.length - 1 ? ', ' : '') }}</a>
                                            </template>
                                        </td>
                                        <td scope="row" :class="task.status.toLowerCase()" style="padding: 1px;" v-if="beatmap.status != 'Ranked'">{{task.status}}</td>
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
import mixin from "../mixins.js";

export default {
    name: 'limited-map-info',
    props: [ 'beatmap', 'userOsuId' ],
    mixins: [ mixin ],
    watch: {
        beatmap: function () {
            this.sortDiffs();
        }
    },
    methods: {
        sortDiffs: function(){
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
