<template>
    <div>
        <div v-if="addCollabInput" class="input-group input-group-sm">
            <input
                class="form-control form-control-sm"
                type="text"
                placeholder="username..."
                v-model="collabMapperToAdd"
                @keyup.enter="addCollab($event)"
            />
            <div class="input-group-append">
                <button
                    class="btn btn-outline-info"
                    @click="addCollab($event)"
                >
                    Invite to {{ collabTask.name }}
                </button>
            </div>
        </div>
        <div v-if="removeCollabInput" class="input-group input-group-sm">
            <input
                class="form-control form-control-sm"
                type="text"
                placeholder="username..."
                id="collabMapperToRemove"
                @keyup.enter="removeCollab($event)"
            />
            <div class="input-group-append">
                <button
                    class="btn btn-outline-danger"
                    @click="removeCollab($event)"
                >
                    Remove from {{ collabTask.name }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import mixin from '../../../mixins.js';

export default {
    name: 'new-collab',
    mixins: [ mixin ],
    props: {
        beatmap: Object,
        isHost: Boolean,
    },
    watch: {
        beatmap: function() {
            this.addCollabInput = null;
        },
    },
    data () {
        return {
            collabMapperToAdd: null,
            addCollabInput: null,
        }
    },
    methods: {
        addCollab: async function(e) {
            let difficulty = $('#diffSelection').val();
            let mode = $('#diffModeSelection').val();
            const bm = await this.executePost('/beatmaps/task/' + this.addCollabInput + '/addCollab', { 
                user: this.collabMapperToAdd, 
                difficulty: difficulty, 
                mode: mode 
            }, e);

            if (bm) {
                this.$emit('update:beatmap', bm);
                this.$emit('update:info', null);
                this.$emit('update:invite-confirm', 'Collab invite sent!');
                this.addCollabInput = null;
            }
        },
        removeCollab: async function(e) {
            const user = $('#collabMapperToRemove').val();
            const id = this.removeCollabInput;
            const bm = await this.executePost('/beatmaps/task/' + id + '/removeCollab', { user: user }, e);
            
            if (bm) {
                this.$emit('update:beatmap', bm);
                this.removeCollabInput = null;
            }
        },
    }
}
</script>

<style>

</style>