<template>
    <div>
        <div class="row mb-2">
            <div class="col">
                <div>
                    Quest 
                    <a
                        href="#"
                        id="editLink"
                        :class="showQuestInput ? 'text-danger' : ''"
                        class="text-success small ml-1"
                        @click.prevent="showQuestInput ? unsetQuest() : setQuest()"
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

        <div
            v-if="showQuestInput"
            class="row mb-2"
        >
            <div class="col">
                <div class="input-group input-group-sm">
                    <select
                        v-model="dropdownQuestId"
                        class="form-control form-control-sm"
                    >
                        <option value="">
                            No quest
                        </option>
                        <option
                            v-for="quest in userQuests"
                            :key="quest.id"
                            :value="quest.id"
                        >
                            {{ quest.name }}
                        </option>
                    </select>
                    <div class="input-group-append">
                        <button
                            class="btn btn-outline-info"
                            @click="saveQuest($event)"
                            data-toggle="tooltip"
                            data-placement="top"
                            title="link beatmap to quest"
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
            this.showQuestInput = false;
        }
    },
    data () {
        return {
            userQuests: null,
            showQuestInput: false,
            dropdownQuestId: '',
        }
    },
    methods: {
        async setQuest() {
            const response = await axios.get('/beatmaps/findUserQuests');
            this.userQuests = response.data.userQuests;
            this.showQuestInput = true;
        },
        unsetQuest() {
            this.showQuestInput = false;
        },
        saveQuest: async function(e) {
            const bm = await this.executePost(
                '/beatmaps/saveQuest/' + this.beatmap._id,
                { questId: this.dropdownQuestId },
                e
            );
            
            if (!bm || bm.error) {
                this.$emit('update:info', (bm && bm.error) || 'Something went wrong!');
            } else {
                this.$emit('update:beatmap', bm);

                // needed at all?
                // axios.get('/beatmaps/relevantInfo').then(response => {
                //     this.$parent.allQuests = response.data.allQuests;
                //     this.$parent.beatmaps = response.data.beatmaps;
                // });
            }
        },
    }
}
</script>
