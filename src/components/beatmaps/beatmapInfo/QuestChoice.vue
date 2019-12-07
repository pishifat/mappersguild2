<template>
    <div>
        <div class="row mb-2">
            <div class="col">
                <div>
                    Quest 
                    <a
                        href="#"
                        id="editLink"
                        :class="editQuestInput ? 'text-danger' : ''"
                        class="text-success small ml-1"
                        @click.prevent="editQuestInput ? unsetQuest() : setQuest()"
                        data-toggle="tooltip"
                        data-placement="right"
                        title="connect mapset with a quest"
                    >
                        <i class="fas fa-edit"></i>
                    </a>
                </div>
                <div class="small ml-3 text-white-50">
                    <span v-if="beatmap.quest">{{ beatmap.quest.name }}</span>
                    <i v-else>none</i>
                </div>
            </div>
        </div>

        <div class="row" id="questInput" v-if="editQuestInput">
            <div class="col">
                <div class="input-group input-group-sm">
                    <select class="form-control form-control-sm" v-model="dropdownQuestId">
                        <option
                            value=""
                            >No quest</option
                        >
                        <template v-for="quest in userQuests">
                            <option
                                :key="quest.id"
                                :value="quest.id"
                                >{{ quest.name }}</option
                            >
                        </template>
                    </select>
                    <div class="input-group-append">
                        <button
                            class="btn btn-outline-info"
                            @click="saveQuest($event)"
                            data-toggle="tooltip"
                            data-placement="top"
                            title="link quest to beatmap"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import mixin from '../../../mixins.js';

export default {
    name: 'quest-choice',
    mixins: [ mixin ],
    props: {
        beatmap: Object,
    },
    watch: {
        beatmap () {
            this.editQuestInput = null;
        }
    },
    data () {
        return {
            editQuestInput: null,
        }
    },
    methods: {
        async setQuest() {
            const response = await axios.get('/beatmaps/findUserQuests');
            this.userQuests = response.data.userQuests;
            this.editQuestInput = true;
        },
        unsetQuest() {
            this.editQuestInput = null;
        },
        saveQuest: async function(e) {
            this.fakeButton = this.beatmap._id + 'quest';
            const bm = await this.executePost('/beatmaps/saveQuest/' + this.beatmap._id, { questId: this.dropdownQuestId }, e);
            
            if (bm) {
                this.$emit('update:beatmap', bm);
                axios.get('/beatmaps/relevantInfo').then(response => {
                    this.$parent.allQuests = response.data.allQuests;
                    this.$parent.beatmaps = response.data.beatmaps;
                });
            }
            this.fakeButton = null;
        },
    }
}
</script>
