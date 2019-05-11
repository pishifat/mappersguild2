<template>
    <div id="extendedInfo" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content bg-dark" v-if="party">
                <div class="modal-header modal-header-card text-dark" :class="'bg-rank-' + party.rank">
                    <h5 class="modal-title modal-title-card">
                        {{ party.name }}
                        <i v-if="party.mode == 'taiko'" class="fas fa-drum"></i>
                        <i v-else-if="party.mode == 'catch'" class="fas fa-apple-alt"></i>
                        <i v-else-if="party.mode == 'mania'" class="fas fa-stream"></i>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body modal-body-card" style="overflow: hidden;">
                    <img src="../../images/the_A.png" class="the-a-background" />
                    <p class="text-shadow">
                        Members: (<span :class="party.id + '-member-count'">{{ party.members.length }}</span
                        >)
                    </p>
                    <p class="indent text-shadow">
                        <template v-for="(member, i) in party.members"
                            ><a :key="i" :href="'https://osu.ppy.sh/users/' + member.osuId" target="_blank">{{
                                member.username + (i < party.members.length - 1 ? ', ' : '')
                            }}</a>
                        </template>
                    </p>
                    <p class="text-shadow">
                        Leader:
                        <a :href="'https://osu.ppy.sh/users/' + party.leader.osuId" target="_blank">{{
                            party.leader.username
                        }}</a>
                    </p>
                    <p class="text-shadow">Rank: {{ party.rank }}</p>
                    <p class="text-shadow">
                        Current Quest:
                        <span :class="party.id + '-quest'">{{
                            party.currentQuest ? party.currentQuest.name : 'none'
                        }}</span>
                    </p>

                    <!-- leader options -->
                    <div v-if="userId == party.leader.osuId">
                        <div class="radial-divisor mx-auto my-3"></div>
                        <p class="text-shadow">Party leader options:</p>
                        <div class="input-group input-group-sm mb-3">
                            <input
                                class="form-control"
                                type="text"
                                placeholder="New name..."
                                id="newName"
                                maxlength="32"
                                @keyup.enter="rename($event)"
                            />
                            <div class="input-group-prepend">
                                <button
                                    class="btn btn-outline-info rename-button"
                                    @click="rename($event)"
                                    type="submit"
                                >
                                    Save new name
                                </button>
                            </div>
                        </div>
                        <div class="input-group input-group-sm mb-3">
                            <input
                                class="form-control"
                                type="text"
                                placeholder="beatmap URL (background = banner)"
                                id="banner"
                                @keyup.enter="addBanner($event)"
                            />
                            <div class="input-group-append">
                                <button
                                    class="btn btn-outline-info banner-button"
                                    @click="addBanner($event)"
                                    type="submit"
                                >
                                    Save banner
                                </button>
                            </div>
                        </div>

                        <div v-if="party.members.length > 1">
                            <div class="input-group input-group-sm mb-3 kick-member-input">
                                <select class="form-control form-control-sm" id="kick">
                                    <template v-for="member in party.members">
                                        <option
                                            :key="member.id"
                                            :value="member.id"
                                            v-if="member.osuId !== userId"
                                            >{{ member.username }}</option
                                        >
                                    </template>
                                </select>
                                <div class="input-group-append">
                                    <button
                                        class="btn btn-outline-danger kick-button"
                                        @click="kickMember($event)"
                                    >
                                        Kick
                                    </button>
                                </div>
                            </div>
                            <div class="input-group input-group-sm mb-3 transfer-leader-input">
                                <select class="form-control form-control-sm" id="transfer">
                                    <template v-for="member in party.members">
                                        <option
                                            :key="member.id"
                                            :value="member.id"
                                            v-if="member.osuId !== userId"
                                            >{{ member.username }}</option
                                        >
                                    </template>
                                </select>
                                <div class="input-group-append">
                                    <button
                                        class="btn btn-outline-info transfer-leader-button"
                                        @click="transferLeader($event)"
                                    >
                                        Transfer Leader
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="input-group input-group-sm mb-3">
                            <input
                                class="form-control form-control-sm"
                                type="text"
                                placeholder="username..."
                                id="inviteMember"
                                maxlength="18"
                                @keyup.enter="inviteMember($event)"
                            />
                            <div class="input-group-append">
                                <button
                                    class="btn btn-outline-info banner-button"
                                    @click="inviteMember($event)"
                                    type="submit"
                                >
                                    Invite Member
                                </button>
                            </div>
                        </div>

                        <p class="text-shadow">
                            Mode:
                            <button
                                class="btn btn-sm btn-info rounded-100"
                                :disabled="party.mode == 'osu'"
                                @click="setMode('osu', $event)"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="osu!"
                            >
                                <i class="far fa-circle"></i>
                            </button>
                            <button
                                class="btn btn-sm btn-info rounded-100"
                                :disabled="party.mode == 'taiko'"
                                @click="setMode('taiko', $event)"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="osu!taiko"
                            >
                                <i class="fas fa-drum"></i>
                            </button>
                            <button
                                class="btn btn-sm btn-info rounded-100"
                                :disabled="party.mode == 'catch'"
                                @click="setMode('catch', $event)"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="osu!catch"
                            >
                                <i class="fas fa-apple-alt"></i>
                            </button>
                            <button
                                class="btn btn-sm btn-info rounded-100"
                                :disabled="party.mode == 'mania'"
                                @click="setMode('mania', $event)"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="osu!mania"
                            >
                                <i class="fas fa-stream"></i>
                            </button>
                        </p>

                        <button
                            class="btn btn-sm justify-content-center"
                            :class="{ 'btn-outline-info': party.lock, 'btn-outline-danger': !party.lock }"
                            @click="switchLock($event)"
                        >
                            {{ party.lock ? 'Allow new members' : 'Disallow new members' }}
                        </button>
                    </div>
                    <!-- end leader options -->

                    <div class="radial-divisor mx-auto my-3"></div>
                    <div
                        v-if="
                            !(
                                !userPartyId &&
                                !party.lock &&
                                !party.currentQuest &&
                                party.members.length < 12
                            ) && userPartyId != party.id
                        "
                    >
                        <p class="small text-shadow">You're unable to join this party because:</p>
                        <ul class="small text-shadow">
                            <li v-if="userPartyId">You can only be in one party at a time</li>
                            <li v-if="party.lock">The party's leader has disabled new member entry</li>
                            <li v-if="party.currentQuest">The party is currently running a quest</li>
                            <li v-if="party.members.length == 12">
                                The party has the maximum number of members (12)
                            </li>
                        </ul>
                    </div>

                    <div
                        v-if="!userPartyId && !party.lock && !party.currentQuest && party.members.length < 12"
                    >
                        <button
                            class="btn btn-outline-info btn-sm justify-content-center float-right"
                            @click="joinParty(party.id, $event)"
                        >
                            Join party
                        </button>
                    </div>
                    <div v-if="userId == party.leader.osuId && party.members.length > 1">
                        <button
                            class="btn btn-outline-danger btn-sm justify-content-center float-right"
                            disabled
                        >
                            Leave party
                        </button>
                    </div>
                    <div
                        v-if="
                            userPartyId == party.id &&
                                party.members.length > 1 &&
                                userId != party.leader.osuId
                        "
                    >
                        <button
                            class="btn btn-outline-danger btn-sm justify-content-center float-right"
                            @click="leaveParty(party.id, $event)"
                        >
                            Leave party
                        </button>
                    </div>
                    <div v-if="userPartyId === party.id && party.members.length == 1">
                        <button
                            class="btn btn-outline-danger btn-sm justify-content-center float-right"
                            @click="deleteParty($event)"
                        >
                            Disband party
                        </button>
                    </div>

                    <p id="errors" class="text-shadow mt-4" :class="inviteConfirm ? 'confirm' : 'errors'">
                        {{ info }} {{ inviteConfirm }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import mixin from '../../mixins.js';

export default {
    name: 'party-info',
    props: ['party', 'userId', 'userPartyId'],
    mixins: [mixin],
    watch: {
        party: function() {
            this.info = null;
            this.inviteConfirm = null;
        },
    },
    methods: {
        executePost: async function(path, data, e) {
            if (e) e.target.disabled = true;

            try {
                const res = await axios.post(path, data);

                if (res.data.error) {
                    this.info = res.data.error;
                    this.inviteConfirm = null;
                } else {
                    if (e) e.target.disabled = false;
                    return res.data;
                }
            } catch (error) {
                console.log(error);
            }

            if (e) e.target.disabled = false;
        },
        joinParty: function(id, e) {
            this.$emit('join-party', { id: this.party.id, e: e });
        },
        leaveParty: function(id, e) {
            this.$emit('leave-party', { id: this.party.id, e: e });
        },
        deleteParty: function(e) {
            this.$emit('delete-party', e);
        },
        rename: async function(e) {
            const newName = $('#newName').val();
            if (newName.length < 3 || newName.length > 32) {
                this.info = 'Choose a name between 3 and 32 characters!';
            } else {
                const party = await this.executePost(
                    '/parties/rename',
                    { id: this.party.id, newName: newName },
                    e
                );
                if (party) {
                    this.$emit('update-party', party);
                }
            }
        },
        addBanner: async function(e) {
            const banner = $('#banner').val();
            const party = await this.executePost('/parties/addBanner', { banner: banner }, e);
            if (party) {
                this.$emit('update-party', party);
            }
        },
        kickMember: async function(e) {
            const user = $('#extendedInfo #kick').val();
            if (user == 'none') {
                this.info = 'Select a user to kick!';
            } else {
                var result = confirm(`Are you sure you want to kick? This action cannot be undone`);
                if (result) {
                    const party = await this.executePost('/parties/kick', { user: user }, e);
                    if (party) {
                        this.$emit('update-party', party);
                    }
                }
            }
        },
        transferLeader: async function(e) {
            const user = $('#extendedInfo #transfer').val();
            if (user == 'none') {
                this.info = 'Select a user to transfer host!';
            } else {
                var result = confirm(
                    `Are you sure you want to transfer leadership? This action cannot be undone`
                );
                if (result) {
                    const party = await this.executePost('/parties/transferLeader', { user: user }, e);
                    if (party) {
                        this.$emit('update-party', party);
                    }
                }
            }
        },
        setMode: async function(mode, e) {
            const party = await this.executePost('/parties/setMode/', { mode: mode }, e);
            if (party) {
                this.$emit('update-party', party);
            }
        },
        switchLock: async function(e) {
            const party = await this.executePost('/parties/switchLock', { partyId: this.party.id }, e);
            if (party) {
                this.$emit('update-party', party);
            }
        },
        inviteMember: async function(e) {
            const user = $('#inviteMember').val();
            const party = await this.executePost('/parties/inviteMember', { user: user }, e);
            if (party) {
                this.inviteConfirm = 'Invite sent!';
                this.info = '';
            }
        },
    },
    data() {
        return {
            info: '',
            inviteConfirm: '',
        };
    },
};
</script>

<style>
</style>
