<template>
    <div>
        <div class="row mb-2">
            <div class="col">
                <div>
                    Quest
                    <a
                        id="editLink"
                        href="#"
                        :class="showQuestInput ? 'text-danger' : ''"
                        class="text-success small ml-1"
                        data-toggle="tooltip"
                        data-placement="right"
                        title="connect mapset with a quest"
                        @click.prevent="showQuestInput = !showQuestInput"
                    >
                        <i class="fas fa-edit" />
                    </a>
                </div>
                <div class="small ml-3 text-white-50">
                    <span v-if="selectedBeatmap.quest">{{ selectedBeatmap.quest.name }}</span>
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
                            :key="quest._id"
                            :value="quest._id"
                        >
                            {{ quest.name }}
                        </option>
                    </select>
                    <div class="input-group-append">
                        <button
                            class="btn btn-outline-info"
                            data-toggle="tooltip"
                            data-placement="top"
                            title="link beatmap to quest"
                            @click="saveQuest($event)"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import Axios from 'axios';

export default Vue.extend({
    name: 'QuestChoice',
    data () {
        return {
            userQuests: null,
            showQuestInput: false,
            dropdownQuestId: '',
        };
    },
    computed: {
        ...mapState([
            'selectedBeatmap',
        ]),
    },
    watch: {
        selectedBeatmap (): void {
            this.showQuestInput = false;
            this.dropdownQuestId = this.selectedBeatmap.quest?._id;
        },
    },
    // async created() {
    //     const response = await Axios.get('/beatmaps/findUserQuests');
    //     this.userQuests = response.data.userQuests;
    // },
    methods: {
        async saveQuest(e): Promise<void> {
            const bm = await this.executePost(
                '/beatmaps/saveQuest/' + this.selectedBeatmap._id,
                { questId: this.dropdownQuestId },
                e
            );

            if (this.isError(bm)) {
                this.$emit('update:info', bm.error);
            } else {
                this.$store.dispatch('updateBeatmap', bm);
            }
        },
    },
});
</script>
