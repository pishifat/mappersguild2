<template>
    <modal-dialog id="editQuest">
        <template #header>
            {{ quest.name }} by
            <user-link
                v-if="quest.creator"
                class="text-dark"
                :user="quest.creator"
            />
        </template>

        <div class="container">
            <p class="row">
                <input
                    v-model="renameQuestName"
                    class="form-control form-control-sm mx-2 w-50"
                    type="text"
                    autocomplete="off"
                    placeholder="quest name..."
                />
                <button class="btn btn-sm btn-outline-info w-25" @click="renameQuest($event)">
                    Rename quest
                </button>
            </p>
            <p class="row">
                <input
                    v-model="price"
                    class="form-control form-control-sm mx-2 w-50"
                    type="text"
                    autocomplete="off"
                    placeholder="price..."
                />
                <button class="btn btn-sm btn-outline-info w-25" @click="updatePrice($event)">
                    Update price
                </button>
            </p>
            <p class="row">
                <input
                    v-model="requiredMapsets"
                    class="form-control form-control-sm mx-2 w-50"
                    type="text"
                    autocomplete="off"
                    placeholder="required mapsets..."
                />
                <button class="btn btn-sm btn-outline-info w-25" @click="updateRequiredMapsets($event)">
                    Update required mapsets
                </button>
            </p>
            <p class="row">
                <input
                    v-model="minParty"
                    class="form-control form-control-sm mx-2 w-50"
                    type="text"
                    autocomplete="off"
                    placeholder="minParty..."
                />
                <button class="btn btn-sm btn-outline-info w-25" @click="updateMinParty($event)">
                    Update minParty
                </button>
            </p>
            <p class="row">
                <input
                    v-model="maxParty"
                    class="form-control form-control-sm mx-2 w-50"
                    type="text"
                    autocomplete="off"
                    placeholder="maxParty..."
                />
                <button class="btn btn-sm btn-outline-info w-25" @click="updateMaxParty($event)">
                    Update maxParty
                </button>
            </p>
            <p class="row">
                <textarea
                    v-model="description"
                    class="form-control form-control-sm mx-2 mt-2 w-50"
                    type="text"
                    autocomplete="off"
                    placeholder="quest description..."
                />
                <button class="btn btn-sm btn-outline-info w-25" @click="updateDescription($event)">
                    Update description
                </button>
            </p>

            <template v-if="quest.status == 'wip'">
                <p>
                    <button class="btn btn-sm btn-outline-danger w-100" @click="dropQuest($event)">
                        Drop quest
                    </button>
                </p>
                <p>
                    <button class="btn btn-sm btn-outline-info w-100" @click="resetQuestDeadline($event)">
                        Reset quest deadline
                    </button>
                </p>
                <p class="row">
                    <span class="col-sm-6">Scheduled for completion: <span class="text-danger">{{ quest.queuedForCompletion ? 'true' : 'false' }}</span></span>
                    <button class="btn btn-sm btn-outline-success col-sm-6 ms-3 w-25" @click="scheduleQuestForCompletion($event)">
                        Toggle
                    </button>
                </p>
            </template>

            <p class="row">
                <input
                    v-model="duplicateQuestName"
                    class="form-control form-control-sm mx-2 w-50"
                    type="text"
                    autocomplete="off"
                    placeholder="new quest name..."
                />
                <button class="btn btn-sm btn-outline-info w-25" @click="duplicateQuest($event)">
                    Duplicate quest
                </button>
            </p>
            <p class="row">
                <input
                    v-model="expiration"
                    class="form-control form-control-sm mx-2 w-50"
                    type="text"
                    autocomplete="off"
                    :placeholder="quest.expiration"
                />
                <button class="btn btn-sm btn-outline-info w-25" @click="updateExpiration($event)">
                    Set expiration date
                </button>
            </p>

            <p>
                <modes-icons
                    :modes="quest.modes"
                    :toggler="true"
                    @toggle="toggleQuestMode($event)"
                />
            </p>

            <associated-beatmaps
                v-if="quest.status == 'done' || quest.status == 'wip'"
                class="mb-4"
                :associated-maps="quest.associatedMaps"
            />

            <p>
                <button class="btn btn-sm btn-outline-danger w-100" @click="deleteQuest($event)">
                    Delete quest
                </button>
            </p>
        </div>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModalDialog from '@components/ModalDialog.vue';
import AssociatedBeatmaps from '@components/quests/partyInfo/AssociatedBeatmaps.vue';
import ModesIcons from '@components/ModesIcons.vue';
import { Quest } from '@interfaces/quest';

export default defineComponent({
    name: 'QuestInfo',
    components: {
        AssociatedBeatmaps,
        ModalDialog,
        ModesIcons,
    },
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
            minParty: this.quest.minParty,
            maxParty: this.quest.maxParty,
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
            this.minParty = this.quest.minParty;
            this.maxParty = this.quest.maxParty;
            this.description = this.quest.descriptionMain;
            this.duplicateQuestName = this.quest.name;
            this.expiration = this.quest.expiration ? this.quest.expiration.toString() : '';
        },
    },
    methods: {
        async renameQuest(e): Promise<void> {
            const name = await this.$http.executePost(`/admin/quests/${this.quest.id}/rename`, { name: this.renameQuestName }, e);

            if (!this.$http.isError(name)) {
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
            const price = await this.$http.executePost(`/admin/quests/${this.quest.id}/updatePrice`, { price: this.price }, e);

            if (!this.$http.isError(price)) {
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
            const requiredMapsets = await this.$http.executePost(`/admin/quests/${this.quest.id}/updateRequiredMapsets`, { requiredMapsets: this.requiredMapsets }, e);

            if (!this.$http.isError(requiredMapsets)) {
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
            const description = await this.$http.executePost(`/admin/quests/${this.quest.id}/updateDescription/`, { description: this.description }, e);

            if (!this.$http.isError(description)) {
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
            const status = await this.$http.executePost(`/admin/quests/${this.quest.id}/drop`, {}, e);

            if (!this.$http.isError(status)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `quest force dropped`,
                    type: 'info',
                });
                this.$store.commit('updateStatus', {
                    questId: this.quest.id,
                    status,
                });
            }
        },
        async scheduleQuestForCompletion(e): Promise<void> {
            const queuedForCompletion = await this.$http.executePost(`/admin/quests/${this.quest.id}/scheduleForCompletion`, { queuedForCompletion: !this.quest.queuedForCompletion }, e);

            if (!this.$http.isError(queuedForCompletion)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `quest queued for completion toggled: ${queuedForCompletion}`,
                    type: 'info',
                });
                this.$store.commit('updateQueuedForCompletion', {
                    questId: this.quest.id,
                    queuedForCompletion,
                });
            }
        },
        async duplicateQuest(e): Promise<void> {
            const quest = await this.$http.executePost(`/admin/quests/${this.quest.id}/duplicate`, { name: this.duplicateQuestName }, e);

            if (!this.$http.isError(quest)) {
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
            const deadline = await this.$http.executePost(`/admin/quests/${this.quest.id}/reset`, {}, e);

            if (!this.$http.isError(deadline)) {
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
                const res = await this.$http.executePost(`/admin/quests/${this.quest.id}/delete`, {}, e);

                if (!this.$http.isError(res)) {
                    this.$bs.hideModal('editQuest');

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
            const quest = await this.$http.executePost(`/admin/quests/${this.quest.id}/toggleMode`, { mode });

            if (!this.$http.isError(quest)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `changed quest modes`,
                    type: 'info',
                });
                this.$store.commit('quests/updateQuest', quest);
            }
        },
        async updateExpiration(e): Promise<void> {
            const expiration = await this.$http.executePost(`/admin/quests/${this.quest.id}/updateExpiration/`, { expiration: this.expiration }, e);

            if (!this.$http.isError(expiration)) {
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
        async updateMinParty(e): Promise<void> {
            const minParty = await this.$http.executePost(`/admin/quests/${this.quest.id}/updateMinParty/`, { minParty: this.minParty }, e);

            if (!this.$http.isError(minParty)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated minParty`,
                    type: 'info',
                });
                this.$store.commit('updateMinParty', {
                    questId: this.quest.id,
                    minParty,
                });
            }
        },
        async updateMaxParty(e): Promise<void> {
            const maxParty = await this.$http.executePost(`/admin/quests/${this.quest.id}/updateMaxParty/`, { maxParty: this.maxParty }, e);

            if (!this.$http.isError(maxParty)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated maxParty`,
                    type: 'info',
                });
                this.$store.commit('updateMaxParty', {
                    questId: this.quest.id,
                    maxParty,
                });
            }
        },
    },
});
</script>