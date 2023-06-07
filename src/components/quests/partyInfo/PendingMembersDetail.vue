<template>
    <div class="ms-3 mt-1">
        <b>
            Pending members:
            ({{ members.length }})
        </b>
        <div class="small text-secondary">
            {{ members.length == 1 ? 'This user needs ' : 'These users need' }} to confirm before they're able to join the party. If you're the party leader, link this page to the {{ members.length == 1 ? 'user ' : 'users' }} below!
        </div>
        <ul class="mb-0">
            <li v-for="member in members" :key="member.id">
                <a
                    v-if="leaderId == loggedInUser.id"
                    v-bs-tooltip="'remove user from pending members'"
                    class="me-1"
                    href="#"
                    @click.stop.prevent="removeFromPendingMembers(member.id, $event)"
                >
                    <i class="fas text-danger fa-times" />
                </a>
                <user-link class="me-1" :user="member" />
                <i
                    v-if="member.rank > 0"
                    v-bs-tooltip="`rank ${member.rank} user`"
                    class="fas fa-crown"
                    :class="'text-rank-' + member.rank"
                />
                <span v-if="member.availablePoints < price" class="text-danger small">
                    {{ `${member.availablePoints} points available. If this user joins, available points will be taken from other party members` }}
                </span>
                <button v-if="loggedInUser.id == member.id" class="btn btn-sm btn-outline-success ms-1" @click="addToParty($event)">
                    Join quest <i class="fas small" :class="price ? 'fa-coins' : 'fa-check'" />
                </button>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { User } from '../../../../interfaces/user';
import { Party } from '@interfaces/party';

export default defineComponent({
    props: {
        members: {
            type: Array as () => User[],
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        partyId: {
            type: String,
            required: true,
        },
        leaderId: {
            type: String,
            required: true,
        },
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
    },
    methods: {
        async addToParty(e): Promise<void> {
            const party = await this.$http.executePost<Party>(`/parties/${this.partyId}/add`, { user: null }, e);

            if (!this.$http.isError(party)) {
                this.$store.dispatch('quests/updateParty', party);
                this.$store.dispatch('updateToastMessages', {
                    message: 'Joined party',
                    type: 'success',
                });
            }
        },
        async removeFromPendingMembers(id, e): Promise<void> {
            e.target.classList.add('fake-button-disable');

            const party = await this.$http.executePost<Party>(`/parties/${this.partyId}/removeFromPendingMembers`, { userId: id }, e);

            if (!this.$http.isError(party)) {
                this.$store.dispatch('quests/updateParty', party);
                this.$store.dispatch('updateToastMessages', {
                    message: 'Removed user from pending members',
                    type: 'success',
                });
            }

            e.target.classList.remove('fake-button-disable');
        },
    },
});
</script>
