<template>
    <div class="col-md-12 my-1">
        <div class="card card-body card-level-2 p-2">
            <div class="card-text small">
                <a
                    :href="'https://osu.ppy.sh/users/' + invite.sender.osuId"
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
                        class="text-done"
                        data-bs-toggle="modal"
                        data-bs-target="#limitedEditBeatmap"
                        @click.prevent="selectBeatmap()"
                    ><i class="far fa-window-maximize" /></a>
                </span>

                <span v-if="invite.party">for quest "{{ invite.quest.name }}" <a
                    href="#"
                    class="text-done"
                    data-bs-toggle="modal"
                    data-bs-target="#limitedEditParty"
                    @click.prevent="selectParty()"
                ><i class="far fa-window-maximize" /></a></span>
            </div>

            <hr>

            <div class="d-flex justify-content-between align-items-center">
                <span class="card-text small">{{ invite.createdAt.toString().slice(0,10) }}</span> <span class="text-danger small">{{ info }}</span>
                <div>
                    <button class="btn btn-outline-danger btn-sm mx-1" @click.prevent="hideInvite($event)">
                        Decline
                    </button>
                    <button class="btn btn-outline-info btn-sm" @click.prevent="acceptInvite($event)">
                        Accept
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Invite } from '../../../interfaces/invite';

export default defineComponent({
    name: 'InviteCard',
    props: {
        invite: {
            type: Object as () => Invite,
            required: true,
        },
    },
    emits: [
        'update:selectedMap',
        'update:selectedParty',
        'hideInvite',
        'acceptInvite',
    ],
    data() {
        return {
            info: '',
        };
    },
    methods: {
        selectBeatmap (): void {
            this.$emit('update:selectedMap', this.invite.map);
        },
        selectParty (): void {
            this.$emit('update:selectedParty', this.invite.party);
        },
        hideInvite (e): void {
            this.$emit('hideInvite', { id: this.invite.id, e });
        },
        acceptInvite(e): void {
            this.$emit('acceptInvite', { id: this.invite.id, e });
        },
    },
});
</script>
