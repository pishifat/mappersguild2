<template>

<div id="extendedInfo" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content custom-bg-dark" v-if="veto">
            <div class="modal-header text-dark">
                <h5 class="modal-title">{{ veto.beatmapLink }}</h5>
                <button type="button" class="close" data-dismiss="modal">
                    <span>&times;</span>
                </button>
            </div>
            <div class="modal-body" style="overflow: hidden">
                <a :href="veto.beatmapLink">{{ veto.beatmapLink.slice(30) }}</a>
                <p class="text-shadow">{{ veto.status }}</p>
                <p class="text-shadow" v-for="debater in veto.debaters" :key="debater.id">{{ debater.username }}</p>
                <p class="text-shadow">{{ veto.mediator || 'pls mediate this' }}</p>
            </div>
        </div>
    </div>
</div>

</template>

<script>
import postData from "../../mixins/postData.js";

export default {
    name: 'veto-info',
    props: [ 'veto', 'user-id' ],
    mixins: [ postData ],
    methods: {
    },
}
</script>