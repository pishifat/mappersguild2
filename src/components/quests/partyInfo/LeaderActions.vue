<template>
    <div class="row mb-2">
        <div class="col-sm form-inline">
            <!-- INVITE -->
            <div class="input-group input-group-sm mr-2">
                <input
                    v-model="inviteUsername"
                    class="form-control"
                    type="text"
                    placeholder="username..."
                    maxlength="18"
                    @keyup.enter="inviteToParty($event)"
                >
                <div class="input-group-append">
                    <button
                        class="btn btn-outline-info"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="invite user to party"
                        @click="inviteToParty($event)"
                    >
                        Invite
                    </button>
                </div>
            </div>

            <!-- TRANSFER/KICK -->
            <div class="input-group input-group-sm mr-2">
                <select v-model="dropdownUserId" class="form-control">
                    <option value="" disabled>
                        Select a member
                    </option>
                    <template v-for="member in party.members">
                        <option
                            v-if="member.id !== userId"
                            :key="member.id"
                            :value="member.id"
                        >
                            {{ member.username }}
                        </option>
                    </template>
                </select>
                <div class="input-group-append">
                    <button
                        class="btn btn-outline-info"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="change party leader"
                        @click="transferPartyLeader($event)"
                    >
                        Lead
                    </button>
                    <button
                        class="btn btn-outline-info"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="kick party member"
                        @click="kickPartyMember($event)"
                    >
                        Kick
                    </button>
                </div>
            </div>

            <!-- only when open -->
            <template v-if="status === 'open'">
                <!-- LOCK -->
                <button class="btn btn-sm btn-outline-info mr-2" @click.prevent="togglePartyLock($event)">
                    {{ party.lock ? 'Unlock' : 'Lock' }} <i class="fas" :class="party.lock ? 'fa-unlock' : 'fa-lock'" />
                </button>

                <!-- DELETE -->
                <button class="btn btn-sm btn-outline-danger" @click.prevent="deleteParty($event)">
                    Delete <i class="fas fa-minus small" />
                </button>
            </template>

            <!-- DROP QUEST -->
            <button
                v-if="quest.status === 'wip'"
                class="btn btn-sm btn-outline-danger mx-2 my-2"
                @click.prevent="dropQuest($event)"
            >
                Drop quest
                <i class="fas fa-times small" />
            </button>

            <!-- ACCEPT QUEST -->
            <button
                v-else-if="quest.status === 'open' && party.rank >= quest.minRank && party.members.length >= quest.minParty && party.members.length <= quest.maxParty"
                class="btn btn-sm btn-outline-success mx-2 my-2"
                @click.prevent="acceptQuest($event)"
            >
                Accept quest
                <i class="fas fa-check small" />
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Quest } from '../../../../interfaces/quest';
import { Party } from '../../../../interfaces/party';
import { mapState } from 'vuex';

export default Vue.extend({
    name: 'LeaderActions',
    props: {
        party: {
            type: Object as () => Party,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
        quest: {
            type: Object as () => Quest,
            required: true,
        },
    },
    data () {
        return {
            inviteUsername: '',
            dropdownUserId: '',
        };
    },
    computed: {
        ...mapState([
            'userId',
        ]),
    },
    methods: {
        async togglePartyLock(e): Promise<void> {
            const quest = await this.executePost(
                '/quests/togglePartyLock/' + this.party.id + '/' + this.quest.id,
                { lock: this.party.lock },
                e
            );

            if (!this.isError(quest)) {
                this.$store.commit('updateQuest', quest);
            }
        },
        async inviteToParty(e): Promise<void> {
            const res = await this.executePost<{ success: string }>('/quests/inviteToParty/' + this.party.id + '/' + this.quest.id, { username: this.inviteUsername }, e);

            if (!this.isError(res)) {
                this.$store.dispatch('updateToastMessages', {
                    message: res.success,
                    type: 'success',
                });
            }
        },
        async transferPartyLeader(e): Promise<void> {
            if (!this.dropdownUserId) {
                this.$store.dispatch('updateToastMessages', {
                    message: 'Select a member to transfer leadership!',
                    type: 'info',
                });

                return;
            }

            const quest = await this.executePost(
                '/quests/transferPartyLeader/' + this.party.id + '/' + this.quest.id,
                { userId: this.dropdownUserId },
                e
            );

            if (!this.isError(quest)) {
                this.$store.commit('updateQuest', quest);
            }
        },
        async kickPartyMember(e): Promise<void> {
            if (!this.dropdownUserId) {
                this.$store.dispatch('updateToastMessages', {
                    message: 'Select a member to kick :(',
                    type: 'info',
                });

                return;
            }

            if (confirm(`Are you sure?`)) {
                const quest = await this.executePost<Quest>('/quests/kickPartyMember/' + this.party.id + '/' + this.quest.id, { userId: this.dropdownUserId }, e);

                if (!this.isError(quest)) {
                    this.$store.commit('updateQuest', quest);

                    // TODO in routes
                    // if kicking someone leads to few members or low rank
                    if (quest.status == 'wip' &&
                        (quest.currentParty.members.length < quest.minParty || quest.currentParty.rank < quest.minRank)
                    ) {
                        this.dropQuest(e);
                    }
                }
            }
        },
        async dropQuest(e): Promise<void> {
            const quests = await this.executePost('/quests/dropQuest/' + this.party.id + '/' + this.quest.id, {}, e);

            if (!this.isError(quests)) {
                this.$store.commit('setQuests', quests);
            }
        },
        async acceptQuest(e): Promise<void> {
            const modes = this.party.modes;
            let modesText = '';

            for (let i = 0; i < modes.length; i++) {
                modesText += modes[i];

                if (i < modes.length-1) {
                    modesText += ', ';
                }
            }

            if (confirm(`Are you sure? This quest will only allow beatmaps of these modes: ${modesText}`)) {
                const quests = await this.executePost('/quests/acceptQuest/' + this.party.id + '/' + this.quest.id, {}, e);

                if (!this.isError(quests)) {
                    this.$store.commit('setQuests', quests);
                }
            }
        },
        async deleteParty(e): Promise<void> {
            if (confirm(`Are you sure?`)) {
                const quest = await this.executePost('/quests/deleteParty/' + this.party.id + '/' + this.quest.id, {}, e);

                if (!this.isError(quest)) {
                    this.$store.commit('updateQuest', quest);
                }
            }
        },
    },
});
</script>