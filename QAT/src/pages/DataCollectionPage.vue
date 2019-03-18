<template>

<div class="row">
    <div class="col-md-12">
        <h2>Disqualifications</h2>
            <table class="small table text-shadow col-md-12 mt-2">
                <thead>
                    <td scope="col" style="padding: 2px;">Date</td>
                    <td scope="col" style="padding: 2px;">Mapset</td>
                    <td scope="col" style="padding: 2px;">Reason</td>
                    <td scope="col" style="padding: 2px;">Validity</td>
                    <td scope="col" style="padding: 2px;"></td>
                </thead>
                <tbody>
                    <tr v-for="dq in dqs" :key="dq.id">
                        <td scope="row" style="padding: 1px;">{{new Date(dq.timestamp).toString().slice(4,15)}}</td>
                        <td scope="row" style="padding: 1px;"><a :href="'https://osu.ppy.sh/beatmapsets/' + dq.beatmapsetId + '/discussion'" target="_blank">{{dq.metadata}}</a></td>
                        <td scope="row" style="padding: 1px;">{{dq.content.slice(0, dq.content.indexOf('.')+1 || 50) + ' [...]'}}</td>
                        <td scope="row" style="padding: 1px;">{{dq.valid ? dq.valid : 'none'}}</td>
                        <td scope="row" style="padding: 1px;">
                            <a href="#"><i class="fas fa-square"></i>
                            <i class="fas fa-square"></i>
                            <i class="fas fa-square"></i>
                        </td>
                    </tr>
                </tbody>
            </table>
    </div>

</div>

</template>



<script>
import postData from '../mixins/postData.js';

export default {
    name: 'data-collection-page',
    mixins: [postData],
    methods: {
        updateDq: function (dq) {
			const i = this.dqs.findIndex(d => d.id == dq.id);
			this.dqs[i] = dq;
        },
        query: async function(e) {
            this.info = '';
            let username = $('#search').val();
            if(!username || !username.length){
                this.info = "Must enter a username!"
            }else{
                const result = await this.executePost('/qat/evalArchive/search/', { username: username }, e);
                if (result) {
                    if (result.error) {
                        this.info = result.error;
                    } else {
                        this.queried = true;
                        this.appEvals = result.a;
                        this.bnEvals = result.b; 
                    }
                }
            }
        }
    },
    data() {
        return {
            dqs: null,
            pops: null,
        }
    },
    created() {
        axios
            .get('/qat/dataCollection/relevantInfo')
            .then(response => {
                this.dqs = response.data.dqs;
                this.pops = response.data.pops;
            }).then(function(){
                $("#loading").fadeOut();
                $("#main").attr("style", "visibility: visible").hide().fadeIn();
            });
    },
}
</script>