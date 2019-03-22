<template>

<div id="extendedInfo" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content" v-if="user">
            <div class="modal-header text-dark" :class="user.probation.length && user.group != 'qat' ? 'bg-probation' : 'bg-' + user.group">
                <h5 class="modal-title">{{user.username}}
                    <i v-if="user.modes.indexOf('osu') >= 0" class="far fa-circle"></i>
                    <i v-if="user.modes.indexOf('taiko') >= 0" class="fas fa-drum"></i>
                    <i v-if="user.modes.indexOf('catch') >= 0" class="fas fa-apple-alt"></i>
                    <i v-if="user.modes.indexOf('mania') >= 0" class="fas fa-stream"></i>
                </h5>
                <button type="button" class="close" data-dismiss="modal">
                    <span>&times;</span>
                </button>
            </div>
            <div class="modal-body" style="overflow: hidden">
                <p class="text-shadow">BN Score: coming soon</p>
                <p v-if="user.id == userId" class="text-shadow">Veto Mediation: 
                    <button 
                        class="btn btn-sm justify-content-center" 
                        :class="{ 'btn-qat': user.vetoMediator, 'btn-qat-red': !user.vetoMediator }" 
                        @click="switchMediator($event)"
                    >
                        {{user.vetoMediator ? 'Opt-in' : 'Opt-out'}}
                    </button>
                </p>
                <hr>
                <button 
                    class="btn btn-qat btn-sm justify-content-center"
                    @click="user.group == 'bn' ? switchGroup('qat', $event) : switchGroup('bn', $event)">
                    {{user.group == 'bn' ? 'Promote to QAT' : 'Promote to BN'}}
                </button>
                <p class="text-shadow float-right">Joined: {{user.createdAt.slice(0,10)}}</p>
            </div>
        </div>
    </div>
</div>

</template>

<script>
import postData from "../../mixins/postData.js";

export default {
    name: 'qat-user-info',
    props: [ 'user', 'user-id' ],
    mixins: [ postData ],
    methods: {
        switchMediator: async function(e){
            const u = await this.executePost('/qat/qatusers/switchMediator/', {}, e);
            if(u){
                if (u.error) {
                    this.info = u.error
                } else {
                    this.$emit('update-user', u);
                }
            }
        },
        switchGroup: async function(group, e){
            const u = await this.executePost('/qat/qatusers/switchGroup/' + this.user.id, {group: group}, e);
            if(u){
                if (u.error) {
                    this.info = u.error
                } else {
                    this.$emit('update-user', u);
                }
            }
        },
    },
}
</script>