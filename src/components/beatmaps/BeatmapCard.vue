<template>
    <div class='my-2 col-sm-12 col-md-6' :class='beatmap.status == "Done" ? "col-lg-12" : beatmap.status == "WIP" ? "col-md-6" : "col-lg-4"' @click="selectBeatmap()">
        <div class='card map-card custom-bg-dark' :class='beatmap.status == "WIP" ? " border-status-wip" : "border-status-done"' data-toggle='modal' data-target='#editBeatmap' :data-mapid="beatmap.id">
            <img class='card-img' :src="processUrl(beatmap.url)" style='opacity:0.5; overflow:hidden'> 
            <div class='card-img-overlay' style='padding: 0.50rem 0.50rem 0 0.50rem'>
                <p class='card-title mb-1 text-shadow'>{{ formatMetadata(beatmap.song.artist, beatmap.song.title) }}</p>
            <small class='card-text text-shadow'>
                Hosted by <a :href="'https://osu.ppy.sh/users/' + beatmap.host.osuId" target="_blank" @click.stop>{{beatmap.host.username}}</a> 
                <i v-if="beatmap.mode == 'taiko'" class="fas fa-drum"></i>
                <i v-else-if="beatmap.mode == 'catch'" class="fas fa-apple-alt"></i>
                <i v-else-if="beatmap.mode == 'mania'" class="fas fa-stream"></i>
                <span class='font-weight-bold float-right' style='text-shadow: 1px 1px 3px black;' v-html="processDiffs(beatmap.tasks, beatmap.tasksLocked)"></span>
            </small> 
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'beatmap-card',
    props: ['beatmap','userOsuId'],
    methods: {
        selectBeatmap: function () {
            this.$emit('update:selectedMap', this.beatmap)
        },
        formatMetadata: function(artist, title) {
            let str = artist + " - " + title;
            if(str.length>39){
                return str.slice(0,39) + "...";
            }else{
                return str;
            }
        },
        processUrl: function(beatmapUrl){
            let url = 'https://osu.ppy.sh/images/layout/beatmaps/default-bg.png';

            if (beatmapUrl && beatmapUrl.indexOf('osu.ppy.sh/beatmapsets/') !== -1) {
                let indexStart = beatmapUrl.indexOf('beatmapsets/') + 'beatmapsets/'.length;
                let indexEnd = beatmapUrl.indexOf('#');
                let idUrl;
                if (indexEnd !== -1) {
                    idUrl = beatmapUrl.slice(indexStart, indexEnd);
                } else {
                    idUrl = beatmapUrl.slice(indexStart);
                }
        
                url = `https://assets.ppy.sh/beatmaps/${idUrl}/covers/card.jpg`;
            }
        
            return url;
        },
        processDiffs: function(tasks, tasksLocked){
            const diffs = [
                {name:"Easy", short:"E", count: 0}, 
                {name:"Normal", short:"N", count: 0}, 
                {name:"Hard", short:"H", count: 0}, 
                {name:"Insane", short:"I", count: 0}, 
                {name:"Expert", short:"X", count: 0}, 
            ];

            let diffsBlock = '';

            if(tasks.length >= 10){
                let singleStatus;
                diffs.forEach(diff => {
                    tasks.forEach(task => {
                        if(diff.name == task.name){
                            diff.count++;
                            singleStatus = task.status.toLowerCase();
                        }
                    });
                    if(diff.count > 0){
                        if(diff.count == 1){
                            diffsBlock += `<span class="px-1 text-shadow ${singleStatus}">${ diff.short }</span>`;
                        }else{
                            diffsBlock += `<span class="px-1 text-shadow" data-toggle="tooltip" data-placement="top" title="${diff.count}">${ diff.short }${diff.count > 1 ? '+' : ''}</span>`;
                        }
                    }else if(tasksLocked.indexOf(diff.name) >= 0){
                        diffsBlock += `<span class="px-1 text-shadow blocked">${ diff.short }</span>`;
                    }else{
                        diffsBlock += `<span class="px-1 text-shadow open">${ diff.short }</span>`;
                    }
                });
            }else{
                diffs.forEach(diff => {
                    let isClaimed = false;
                    let isUsed = false;
                    tasks.forEach(task => {
                        if(diff.name == task.name){
                          diffsBlock += `<span class="px-1 text-shadow ${ task.status.toLowerCase() }">${ diff.short }</span>`;
            
                          isClaimed = true;
                          isUsed = true;
                        }
                    });
                    tasksLocked.forEach(task => {
                        if (diff.name == task) {
                            if (!isClaimed){
                                diffsBlock += `<span class="px-1 text-shadow blocked">${ diff.short }</span>`;
                            }
                            
                            isUsed = true;
                        }
                    });
                    if (!isUsed) {
                        diffsBlock += `<span class="px-1 text-shadow open">${ diff.short }</span>`;
                    }
                });
            }
            return diffsBlock;
        },
    },
}
</script>
