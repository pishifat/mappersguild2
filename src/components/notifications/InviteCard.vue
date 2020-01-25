<template>
    <div class="col-md-12 my-2">
        <div class="card bg-dark">
            <div class="card-body notification-card-spacing">
                <p class="card-text text-shadow small">
                    <a
                        :href="'https://osu.ppy.sh/users/' + invite.sender.osuId"
                        class="text-shadow"
                        target="_blank"
                        @click.stop
                    >
                        {{ invite.sender.username }}
                    </a>

                    {{ invite.info }}

                    <span v-if="invite.map">
                        <span v-if="invite.map.url"><a :href="invite.map.url" target="_blank">{{ invite.map.song.artist }} - {{ invite.map.song.title }}</a></span>
                        <span v-else>{{ invite.map.song.artist }} - {{ invite.map.song.title }}</span>
                        <a
                            href="#"
                            class="icon-valid"
                            :data-user="invite.map.id"
                            data-toggle="modal"
                            data-target="#limitedEditBeatmap"
                            @click.prevent="selectBeatmap()"
                        ><i class="far fa-window-maximize" /></a>
                    </span>

                    <span v-if="invite.party">for quest "{{ invite.quest.name }}" <a
                        href="#"
                        class="icon-valid"
                        :data-user="invite.party.id"
                        data-toggle="modal"
                        data-target="#limitedEditParty"
                        @click.prevent="selectParty()"
                    ><i class="far fa-window-maximize" /></a></span>
                </p>
            </div>

            <div class="card-footer notification-card-spacing mx-2">
                <span class="card-text text-shadow small">{{ invite.createdAt.slice(0,10) }}</span> <span class="errors small text-shadow">{{ info }}</span>
                <button class="btn btn-outline-danger notification-button float-right mx-1" @click.prevent="hideInvite($event)">
                    Decline
                </button>
                <button class="btn btn-outline-info notification-button float-right mx-1" @click.prevent="acceptInvite($event)">
                    Accept
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Axios from 'axios';
import { Invite } from '@models/notification';

export default Vue.extend({
    name: 'InviteCard',
    props: {
        invite: {
            type: Object as () => Invite,
            required: true,
        },
    },
    data() {
        return {
            info: '',
        };
    },
    methods: {
        async executePost (path, data, e): Promise<void> {
            if (e) e.target.disabled = true;

            try {
                const res = await Axios.post(path, data);

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
        selectBeatmap (): void {
            this.$emit('update:selectedMap', this.invite.map);
        },
        selectParty (): void {
            this.$emit('update:selectedParty', this.invite.party);
        },
        hideInvite (e): void {
            this.$emit('hide-invite', { id: this.invite.id, e });
        },
        async acceptInvite(e): Promise<void> {
            let invite;

            if (this.invite.actionType == 'collaborate in a difficulty') {
                invite = await this.executePost('/notifications/acceptCollab/' + this.invite.id, {}, e);
            } else if (this.invite.actionType == 'create a difficulty') {
                invite = await this.executePost('/notifications/acceptDiff/' + this.invite.id, {}, e);
            } else if (this.invite.actionType == 'host') {
                invite = await this.executePost('/notifications/acceptHost/' + this.invite.id, {}, e);
            } else if (this.invite.actionType == 'join') {
                invite = await this.executePost('/notifications/acceptJoin/' + this.invite.id, {}, e);
            }

            if (invite) {
                this.$emit('hide-accepted-invite', { id: this.invite.id, e });
            }
        },
    },
});
</script>
