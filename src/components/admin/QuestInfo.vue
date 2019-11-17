<template>
    <div id="editQuest" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content bg-dark" v-if="quest">
                <div class="modal-header text-dark bg-rest">
                    <h5 class="modal-title">{{ quest.name }}</h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden">
                    <p>
                        <button class="btn btn-sm btn-outline-danger" @click="dropQuest($event)">
                            Drop quest
                        </button>
                    </p>
                    <p>
                        <button class="btn btn-sm btn-outline-success" @click="completeQuest($event)">
                            Complete quest
                        </button>
                    </p>
                    <p>
                        <button class="btn btn-sm btn-outline-info" @click="duplicateQuest($event)">
                            Duplicate quest
                        </button> 
                        <input
                            class="form-control-sm mx-2 w-50"
                            type="text"
                            autocomplete="off"
                            placeholder="new quest name..."
                            v-model="duplicateQuestName"
                        />
                    </p>
                    <p>
                        <button class="btn btn-sm btn-outline-info" @click="resetQuestDeadline($event)">
                            Reset quest deadline
                        </button> 
                    </p>
                    <p>
                        <button class="btn btn-sm btn-outline-danger" @click="deleteQuest($event)">
                            Delete quest
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'quest-info',
    props: ['quest'],
    watch: {
        quest: function() {
            this.duplicateQuestName = this.quest.name;
        },
    },
    methods: {
        executePost: async function(path, data, e) {
            if (e) e.target.disabled = true;

            try {
                const res = await axios.post(path, data);

                if (res.data.error) {
                    this.info = res.data.error;
                } else {
                    if (e) e.target.disabled = false;
                    return res.data;
                }
            } catch (error) {
                console.log(error);
            }

            if (e) e.target.disabled = false;
        },
        dropQuest: async function(e) {
            const q = await this.executePost('/admin/dropQuest/' + this.quest.id, {}, e);
            if (q) {
                this.$emit('update-quest', q);
            }
        },
        completeQuest: async function(e) {
            const q = await this.executePost('/admin/completeQuest/' + this.quest.id, {}, e);
            if (q) {
                this.$emit('update-quest', q);
            }
        },
        duplicateQuest: async function(e) {
            const q = await this.executePost('/admin/duplicateQuest/' + this.quest.id, {name: this.duplicateQuestName}, e);
            if (q) {
                this.$emit('add-quest', q);
            }
        },
        resetQuestDeadline: async function(e) {
            const q = await this.executePost('/admin/resetQuestDeadline/' + this.quest.id, {}, e);
            if (q) {
                this.$emit('update-quest', q);
            }
        },
        deleteQuest: async function(e) {
            const q = await this.executePost('/admin/deleteQuest/' + this.quest.id, {}, e);
            if (q) {
                $('#editQuest').modal('hide');
                this.$emit('delete-quest', q);
            }
        },
    },
    data() {
        return {
            duplicateQuestName: null,
        };
    },
};
</script>