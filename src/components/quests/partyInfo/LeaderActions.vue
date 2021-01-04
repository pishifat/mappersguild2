<template>
    <div class="row row-cols-md-auto g-2 align-items-center mb-3">
        <!-- INVITE -->
        <div class="col-12">
            <div class=" input-group input-group-sm">
                <input
                    v-model="inviteUsername"
                    class="form-control"
                    type="text"
                    placeholder="username..."
                    maxlength="18"
                    @keyup.enter="inviteToParty($event)"
                >
                <button
                    v-bs-tooltip="'invite user to party'"
                    class="btn btn-outline-info"
                    @click="inviteToParty($event)"
                >
                    Invite
                </button>
            </div>
        </div>

        <!-- TRANSFER/KICK -->
        <div class="col-12">
            <div class="input-group input-group-sm">
                <select v-model="dropdownUserId" class="form-select">
                    <option value="" disabled>
                        Select a member
                    </option>
                    <template
                        v-for="member in party.members"
                        :key="member.id"
                    >
                        <option
                            v-if="member.id !== loggedInUser.id"
                            :value="member.id"
                        >
                            {{ member.username }}
                        </option>
                    </template>
                </select>
                <button
                    v-bs-tooltip="'change party leader'"
                    class="btn btn-outline-info"
                    @click="transferPartyLeader($event)"
                >
                    Lead
                </button>
                <button
                    v-bs-tooltip="'kick party member'"
                    class="btn btn-outline-info"
                    @click="kickPartyMember($event)"
                >
                    Kick
                </button>
            </div>
        </div>

        <!-- only when open -->
        <template v-if="status === 'open'">
            <!-- LOCK -->
            <div class="col-12">
                <button class="btn btn-sm btn-outline-info w-100" @click.prevent="togglePartyLock($event)">
                    {{ party.lock ? 'Unlock' : 'Lock' }} <i class="fas" :class="party.lock ? 'fa-unlock' : 'fa-lock'" />
                </button>
            </div>

            <!-- DELETE -->
            <div class="col-12">
                <button class="btn btn-sm btn-outline-danger w-100" @click.prevent="deleteParty($event)">
                    Delete <i class="fas fa-minus fa-xs" />
                </button>
            </div>
        </template>

        <!-- EXTEND DEADLINE -->
        <template v-if="status === 'wip'">
            <div class="col-12">
                <button
                    v-bs-tooltip="'each party member spends 10 points to extend quest deadline'"
                    class="btn btn-sm btn-outline-danger w-100"
                    @click.prevent="extendDeadline($event)"
                >
                    Extend deadline for 10 points
                    <i class="fas fa-coins fa-xs" />
                </button>
            </div>

            <!-- DROP QUEST -->
            <div class="col-12">
                <button
                    class="btn btn-sm btn-outline-danger w-100"
                    @click.prevent="dropQuest($event)"
                >
                    Drop quest
                    <i class="fas fa-times fa-xs" />
                </button>
            </div>
        </template>

        <!-- ACCEPT QUEST -->
        <div
            v-else-if="quest.status === 'open' &&
                party.rank >= quest.minRank &&
                party.members.length >= quest.minParty &&
                party.members.length <= quest.maxParty
            "
            class="col-12"
        >
            <button
                class="btn btn-sm btn-outline-success w-100"
                :disabled="!enoughPoints"
                @click.prevent="acceptQuest($event)"
            >
                {{ price ? `Accept quest for ${price} ${price == 1 ? 'point' : 'points'} from each party member` : 'Accept Quest' }}
                <i class="fas small" :class="price ? 'fa-coins' : 'fa-check'" />
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { Quest } from '@interfaces/quest';
import { Party } from '@interfaces/party';
import { ExtendDeadlineResponse, PointsRefreshResponse } from '@interfaces/api/quests';

export default defineComponent({
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
        price: {
            type: Number,
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
            'loggedInUser',
        ]),
        enoughPoints(): boolean {
            let valid = true;
            this.party.members.forEach(member => {
                if (member.availablePoints < this.price) valid = false;
            });

            return valid;
        },
    },
    methods: {
        async togglePartyLock(e): Promise<void> {
            const party = await this.$http.executePost(`/parties/${this.party.id}/toggleLock`, {}, e);

            if (!this.$http.isError(party)) {
                this.$store.dispatch('quests/updateParty', party);
            }
        },
        async inviteToParty(e): Promise<void> {
            const res = await this.$http.executePost<{ success: string }>(`/parties/${this.party.id}/invite`, { username: this.inviteUsername }, e);

            if (!this.$http.isError(res)) {
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

            const party = await this.$http.executePost(
                `/parties/${this.party.id}/transferLeadership`,
                { userId: this.dropdownUserId },
                e
            );

            if (!this.$http.isError(party)) {
                this.$store.dispatch('quests/updateParty', party);
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

            if (confirm(`Are you sure? ${this.party.members.length == this.quest.minParty && this.quest.status == 'wip' ? 'This party has the minimum required members to run the quest, so kicking will cause the quest to be dropped.' : ''}`)) {
                const party = await this.$http.executePost<Party>(`/parties/${this.party.id}/kick`, { userId: this.dropdownUserId }, e);

                if (!this.$http.isError(party)) {
                    this.$store.dispatch('quests/updateParty', party);

                    // TODO in routes
                    // if kicking someone leads to few members or low rank
                    if (
                        this.quest.status == 'wip' &&
                        (party.members.length < this.quest.minParty || party.rank < this.quest.minRank)
                    ) {
                        this.dropQuest(e);
                    }
                }
            }
        },
        async extendDeadline(e): Promise<void> {
            if (confirm(`Are you sure?\n\nAll members of your party will spend 10 points.\n\nYou have ${this.loggedInUser.availablePoints} points available.`)) {
                const res = await this.$http.executePost<ExtendDeadlineResponse>(`/quests/${this.quest.id}/extendDeadline`, {}, e);

                if (!this.$http.isError(res)) {
                    this.$store.dispatch('quests/updateQuest', res.quest);
                    this.$store.commit('setAvailablePoints', res.availablePoints);
                }
            }
        },
        async dropQuest(e): Promise<void> {
            if (confirm(`Are you sure?`)) {
                const quests = await this.$http.executePost<Quest[]>(`/quests/${this.quest.id}/drop`, {}, e);

                if (!this.$http.isError(quests)) {
                    this.$bs.hideModal('editQuest');
                    this.$store.dispatch('quests/setQuests', quests);
                }
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

            if (confirm(`Are you sure?\n\nThis quest will only allow beatmaps of these modes: ${modesText}\n\nAll members of your party will spend ${this.price} points.\n\nYou have ${this.loggedInUser.availablePoints} points available.`)) {
                const res = await this.$http.executePost<PointsRefreshResponse>(`/quests/${this.quest.id}/accept`, {}, e);

                if (!this.$http.isError(res)) {
                    this.$store.dispatch('quests/setQuests', res.quests);
                    this.$store.commit('setAvailablePoints', res.availablePoints);
                    this.$bs.hideModal('editQuest');
                }
            }
        },
        async deleteParty(e): Promise<void> {
            if (confirm(`Are you sure?`)) {
                const quest = await this.$http.executePost(`/parties/${this.party.id}/delete`, {}, e);

                if (!this.$http.isError(quest)) {
                    this.$store.dispatch('quests/updateQuest', quest);
                    this.$bs.hideModal('editQuest');
                }
            }
        },
    },
});
</script>