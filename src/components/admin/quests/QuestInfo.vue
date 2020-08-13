<template>
    <div id="editQuest" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
            <div v-if="quest" class="modal-content bg-dark">
                <div class="modal-header text-dark bg-rest">
                    <h5 class="modal-title">
                        {{ quest.name }} by
                        <a
                            v-if="quest.creator"
                            :href="'https://osu.ppy.sh/users/' + quest.creator.osuId"
                            class="text-dark"
                            target="_blank"
                        >
                            {{ quest.creator.username }}
                        </a>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden">
                    <p>
                        <button class="btn btn-sm btn-outline-info" @click="renameQuest($event)">
                            Rename quest
                        </button>
                        <input
                            v-model="renameQuestName"
                            class="form-control-sm mx-2 w-50"
                            type="text"
                            autocomplete="off"
                            placeholder="quest name..."
                        >
                    </p>
                    <p>
                        <button class="btn btn-sm btn-outline-info" @click="updatePrice($event)">
                            Update price
                        </button>
                        <input
                            v-model="price"
                            class="form-control-sm mx-2 w-50"
                            type="text"
                            autocomplete="off"
                            placeholder="price..."
                        >
                    </p>
                    <p>
                        <button class="btn btn-sm btn-outline-info" @click="updateRequiredMapsets($event)">
                            Update required mapsets
                        </button>
                        <input
                            v-model="requiredMapsets"
                            class="form-control-sm mx-2 w-50"
                            type="text"
                            autocomplete="off"
                            placeholder="required mapsets..."
                        >
                    </p>
                    <p>
                        <button class="btn btn-sm btn-outline-info" @click="updateDescription($event)">
                            Update description
                        </button>
                    </p>
                    <p>
                        <textarea
                            v-model="description"
                            class="form-control-sm mx-2 mt-2 w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="quest description..."
                        />
                    </p>
                    <template v-if="quest.status == 'wip'">
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
                            <button class="btn btn-sm btn-outline-info" @click="resetQuestDeadline($event)">
                                Reset quest deadline
                            </button>
                        </p>
                    </template>
                    <p>
                        <button class="btn btn-sm btn-outline-info" @click="duplicateQuest($event)">
                            Duplicate quest
                        </button>
                        <input
                            v-model="duplicateQuestName"
                            class="form-control-sm mx-2 w-50"
                            type="text"
                            autocomplete="off"
                            placeholder="new quest name..."
                        >
                    </p>
                    <p>
                        <button class="btn btn-sm btn-outline-info" @click="updateExpiration($event)">
                            Set expiration date
                        </button>
                        <input
                            v-model="expiration"
                            class="form-control-sm mx-2 w-50"
                            type="text"
                            autocomplete="off"
                            :placeholder="quest.expiration"
                        > {{ quest.isExpired }}
                    </p>
                    <p>
                        <a href="#" @click.prevent="toggleQuestMode('osu')">
                            <i
                                class="fas fa-circle"
                                :class="quest.modes.includes('osu') ? '' : 'text-white-50'"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="toggle osu!"
                            />
                        </a>
                        <a href="#" @click.prevent="toggleQuestMode('taiko')">
                            <i
                                class="fas fa-drum"
                                :class="quest.modes.includes('taiko') ? '' : 'text-white-50'"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="toggle osu!taiko"
                            />
                        </a>
                        <a href="#" @click.prevent="toggleQuestMode('catch')">
                            <i
                                class="fas fa-apple-alt"
                                :class="quest.modes.includes('catch') ? '' : 'text-white-50'"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="toggle osu!catch"
                            />
                        </a>
                        <a href="#" @click.prevent="toggleQuestMode('mania')">
                            <i
                                class="fas fa-stream"
                                :class="quest.modes.includes('mania') ? '' : 'text-white-50'"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="toggle osu!mania"
                            />
                        </a>
                    </p>
                    <div v-if="quest.status == 'done' || quest.status.includes('wip')" class="mb-4">
                        <div>
                            Associated maps
                        </div>
                        <ul v-if="quest.associatedMaps.length" class="ml-3">
                            <li v-for="map in quest.associatedMaps" :key="map.id" class="small text-white-50">
                                <template v-if="map.url">
                                    <a :href="map.url" target="_blank">{{ map.song.artist }} - {{ map.song.title }}</a> by <a :href="'https://osu.ppy.sh/users/' + map.host.osuId" target="_blank">{{ map.host.username }}</a>
                                </template>
                                <template v-else>
                                    {{ map.song.artist }} - {{ map.song.title }} by <a :href="'https://osu.ppy.sh/users/' + map.host.osuId" target="_blank">{{ map.host.username }}</a>
                                </template>
                            </li>
                        </ul>
                        <div v-else class="small text-white-50 ml-3">
                            No associated maps...
                        </div>
                    </div>
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

<script lang="ts">
import Vue from 'vue';
import { Quest } from '../../../../interfaces/quest';

export default Vue.extend({
    name: 'QuestInfo',
    props: {
        quest: {
            type: Object as () => Quest,
            required: true,
        },
    },
    data() {
        return {
            renameQuestName: this.quest.name,
            price: this.quest.price,
            requiredMapsets: this.quest.requiredMapsets,
            description: this.quest.descriptionMain,
            duplicateQuestName: this.quest.name,
            expiration: this.quest.expiration ? this.quest.expiration.toString() : '',
        };
    },
    watch: {
        quest(): void {
            this.renameQuestName = this.quest.name;
            this.price = this.quest.price;
            this.requiredMapsets = this.quest.requiredMapsets;
            this.description = this.quest.descriptionMain;
            this.duplicateQuestName = this.quest.name;
            this.expiration = this.quest.expiration ? this.quest.expiration.toString() : '';
        },
    },
    methods: {
        async renameQuest(e): Promise<void> {
            const name = await this.executePost(`/admin/quests/${this.quest.id}/rename`, { name: this.renameQuestName }, e);

            if (!this.isError(name)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `renamed quest`,
                    type: 'info',
                });
                this.$store.commit('renameQuest', {
                    questId: this.quest.id,
                    name,
                });
            }
        },
        async updatePrice(e): Promise<void> {
            const price = await this.executePost(`/admin/quests/${this.quest.id}/updatePrice`, { price: this.price }, e);

            if (!this.isError(price)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated price`,
                    type: 'info',
                });
                this.$store.commit('updatePrice', {
                    questId: this.quest.id,
                    price,
                });
            }
        },
        async updateRequiredMapsets(e): Promise<void> {
            const requiredMapsets = await this.executePost(`/admin/quests/${this.quest.id}/updateRequiredMapsets`, { requiredMapsets: this.requiredMapsets }, e);

            if (!this.isError(requiredMapsets)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated required mapsets`,
                    type: 'info',
                });
                this.$store.commit('updateRequiredMapsets', {
                    questId: this.quest.id,
                    requiredMapsets,
                });
            }
        },
        async updateDescription(e): Promise<void> {
            const description = await this.executePost(`/admin/quests/${this.quest.id}/updateDescription/`, { description: this.description }, e);

            if (!this.isError(description)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated quest description`,
                    type: 'info',
                });
                this.$store.commit('updateDescription', {
                    questId: this.quest.id,
                    description,
                });
            }
        },
        async dropQuest(e): Promise<void> {
            const quest = await this.executePost(`/admin/quests/${this.quest.id}/drop`, {}, e);

            if (!this.isError(quest)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `quest force dropped`,
                    type: 'info',
                });
                this.$store.commit('updateQuest', quest);
            }
        },
        async completeQuest(e): Promise<void> {
            const quest = await this.executePost(`/admin/quests/${this.quest.id}/complete`, {}, e);

            if (!this.isError(quest)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `quest marked as complete`,
                    type: 'info',
                });
                this.$store.commit('updateQuest', quest);
            }
        },
        async duplicateQuest(e): Promise<void> {
            const quest = await this.executePost(`/admin/quests/${this.quest.id}/duplicate`, { name: this.duplicateQuestName }, e);

            if (!this.isError(quest)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `quest duplicated`,
                    type: 'info',
                });
                this.$store.commit('addQuest', {
                    quest,
                });
            }
        },
        async resetQuestDeadline(e): Promise<void> {
            const deadline = await this.executePost(`/admin/quests/${this.quest.id}/reset`, {}, e);

            if (!this.isError(deadline)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `reset quest deadline to ${deadline}`,
                    type: 'info',
                });
                this.$store.commit('resetQuestDeadline', {
                    questId: this.quest.id,
                    deadline,
                });
            }
        },
        async deleteQuest(e): Promise<void> {
            const result = confirm('Are you sure?');

            if (result) {
                const res = await this.executePost(`/admin/quests/${this.quest.id}/delete`, {}, e);

                if (!this.isError(res)) {
                    ($('#editQuest')).modal('hide');
                    this.$store.dispatch('updateToastMessages', {
                        message: `quest deleted`,
                        type: 'info',
                    });
                    this.$store.commit('deleteQuest', {
                        questId: this.quest.id,
                    });
                }
            }
        },
        async toggleQuestMode(mode): Promise<void> {
            const quest = await this.executePost(`/admin/quests/${this.quest.id}/toggleMode`, { mode });

            if (!this.isError(quest)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `changed quest modes`,
                    type: 'info',
                });
                this.$store.commit('updateQuest', quest);
            }
        },
        async updateExpiration(e): Promise<void> {
            const expiration = await this.executePost(`/admin/quests/${this.quest.id}/updateExpiration/`, { expiration: this.expiration }, e);

            if (!this.isError(expiration)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated quest expiration`,
                    type: 'info',
                });
                this.$store.commit('updateExpiration', {
                    questId: this.quest.id,
                    expiration,
                });
            }
        },
    },
});
</script>