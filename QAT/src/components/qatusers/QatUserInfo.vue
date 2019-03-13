<template>

<div id="extendedInfo" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content custom-bg-dark" v-if="user">
            <div class="modal-header text-dark" :class="!user.probation ? 'bg-' + user.group : 'bg-probation'">
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
                <p class="text-shadow">BN Score: 394394</p>
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
                <p class="text-shadow float-right">Joined: {{user.createdAt.slice(0,10)}}</p>
            </div>
        </div>
    </div>
</div>

</template>

<script>
import mixin from "../../mixins.js";

export default {
    name: 'qat-user-info',
    props: [ 'user', 'user-id' ],
    mixins: [ mixin ],
    methods: {
        executePost: async function (path, data, e) {
            if (e) e.target.disabled = true;

            try {
                const res = await axios.post(path, data)

                if (res.data.error) {
                    this.info = res.data.error;
                } else {
                    if (e) e.target.disabled = false;
                    return res.data;
                }
            } catch (error) {
                console.log(error)
            }

            if (e) e.target.disabled = false;
        },
        switchMediator: async function(e){
            const u = await this.executePost('/qat/qatusers/switchMediator/' + this.user.id, {}, e);
            if(u){
                this.$emit('update-user', u);
            }
        },
    },
}
</script>