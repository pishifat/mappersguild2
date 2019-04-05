<template>

<div class="row">
   <div class="col-md-12 mb-4">
       <div class="input-group input-group-sm mb-3" style="width: 400px" id="artistForm">
            <select class="custom-select select-arrow small" id="questionType" style="border-radius: 100px 0 0 100px">
                <option value='codeOfConduct'>Code of Conduct</option>
                <option value='general'>General</option>
                <option value='spread'>Spread</option>
                <option value='metadata'>Metadata</option>
                <option value='timing'>Timing</option>
                <option value='audio'>Audio</option>
                <option value='videoBackground'>Video/BG</option>
                <option value='skinning'>Skinning</option>
                <option value='storyboarding'>Storyboarding</option>
                <option value='osu'>osu!</option>
                <option value='taiko'>osu!taiko</option>
                <option value='catch'>osu!catch</option>
                <option value='mania'>osu!mania</option>
                <option value='bn'>BN Rules</option>
            </select>
            <div class="input-group-append">
                <button style="border-radius: 0 100px 100px 0;" class="rounded-circle-left btn btn-qat" id="artistButton" @click="loadContent($event);">Load test content</button>
            </div>
        </div>
        <p class="errors">{{info}}</p> 
    </div>

</div>

</template>



<script>
export default {
    name: 'manage-test-page',
    components: {

    },
    watch: {
        
    },
    methods: {
        updateReport: function (report) {
			const i = this.reports.findIndex(r => r.id == report.id);
			this.reports[i] = report;
            this.selectedReport = report;
            this.categorize();
        },
        categorize: function(){
            this.openReports = this.reports.filter( report => !report.feedback || !report.valid);
            this.closedReports = this.reports.filter( report => report.feedback && report.valid);
        }
    },
    data() {
        return {
            reports: null,
            openReports: null,
            closedReports: null,
            selectedReport: null,
            info: '',
        }
    },
    created() {
        $("#loading").hide(); //this is temporary
        $("#main").attr("style", "visibility: visible").hide().fadeIn();
    }
}
</script>