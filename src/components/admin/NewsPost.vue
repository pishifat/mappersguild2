<template>
    <div id="newsPost" class="modal fade" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content bg-dark">
                <div class="modal-header text-dark bg-rest">
                    <h5 class="modal-title">
                        Generate news post
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden">
                    <p>
                        <button class="btn btn-sm btn-outline-info" @click="loadNewsInfo($event)">
                            Load beatmap and quest data
                        </button>
                        <input
                            class="form-control-sm mx-2 w-25"
                            type="text"
                            autocomplete="off"
                            placeholder="YYYY-MM-DD"
                            v-model="date"
                        />
                    </p>
                    <p v-if="quests">Quest data:</p>
                    <div v-if="quests" class="copy-paste">
                        <span v-for="quest in quests" :key="quest.id">
                            <br><samp class="small text-white-50">
                                {{quest.art ? 
                                '![Artist header image](https://assets.ppy.sh/artists/' + quest.art + '/header.jpg' : 
                                '![Mystery quest header image](/wiki/shared/news/banners/mappersguildmysteryquest.png)'}}
                            </samp><br><br>
                            <samp class="small text-white-50">
                                **Quest Objective:** {{ quest.descriptionMain }}
                            </samp><br><br>
                            <samp class="small text-white-50">
                                The **{{ quest.name }}** quest was completed by
                                <span v-for="(member, i) in quest.completedMembers" :key="member.id">
                                    **[{{ member.username }}]({{'https://osu.ppy.sh/users/' + member.osuId}})**{{(i < quest.completedMembers.length - 2 ? ', ' : i < quest.completedMembers.length - 1 ? ' and' : '.')}}
                                </span>
                            </samp><br><br>
                            <span v-for="beatmap in quest.associatedMaps" :key="beatmap.id">
                                <samp class="small text-white-50">
                                    - [{{ beatmap.song.artist }} - {{ beatmap.song.title }}]({{ beatmap.url }})
                                    by
                                    [{{ beatmap.host.username }}]({{ 'https://osu.ppy.sh/users/' + beatmap.host.osuId }})
                                    ({{beatmap.mode == 'osu' ? 'osu!' : beatmap.mode == 'hybrid' ? 'hybrid' : 'osu!' + beatmap.mode }})
                                </samp><br>
                            </span>
                        </span>
                    </div>
                    <p v-if="beatmaps">Other beatmap data:</p>
                    <div v-if="beatmaps" class="copy-paste">
                        <span v-for="beatmap in beatmaps" :key="beatmap.id">
                            <samp class="small text-white-50">
                                - [{{ beatmap.song.artist }} - {{ beatmap.song.title }}]({{ beatmap.url }})
                                by
                                [{{ beatmap.host.username }}]({{ 'https://osu.ppy.sh/users/' + beatmap.host.osuId }})
                                ({{beatmap.mode == 'osu' ? 'osu!' : beatmap.mode == 'hybrid' ? 'hybrid' : 'osu!' + beatmap.mode }})
                            </samp><br>
                        </span>
                    </div>
                    <p v-if="info" class="errors">{{ info }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'news-post',
    methods: {
        loadNewsInfo: async function(e) {
            e.target.disabled = true;
            axios
                .get('/admin/loadNewsInfo/' + this.date)
                .then(response => {
                    e.target.disabled = false;
                    if(response.data.error){
                        this.info = response.data.error;
                    }else{
                        this.info = null;
                        this.beatmaps = response.data.beatmaps;
                        this.quests = response.data.quests;
                    }
            });
        },
    },
    data() {
        return {
            date: '2019-09-23',
            beatmaps: null,
            quests: null,
            info: null,
        };
    },
};
</script>

<style>
.copy-paste {
    background-color: darkslategray;
    margin: 0.75rem 0.75rem 0.75rem 0.75rem;
    padding: 0.75rem 0.75rem 0.75rem 0.75rem;
    box-shadow: 1px 1px 2px 1px black;
}
</style>