<template>
    <div class="col-md-12 my-2">
        <div class="card static-card bg-dark">
            <div class="card-body notification-card-spacing">
                <p class="card-text small">
                    <a
                        :href="'https://osu.ppy.sh/users/' + notification.sender.osuId"
                        target="_blank"
                        @click.stop
                    >
                        {{ notification.sender.username }}
                    </a>

                    {{ notification.info }}

                    <span v-if="notification.map">
                        <span v-if="notification.map.url"><a :href="notification.map.url" target="_blank">"{{ notification.map.song.artist }} - {{ notification.map.song.title }}"</a></span>
                        <span v-else>"{{ notification.map.song.artist }} - {{ notification.map.song.title }}"</span>
                        <a
                            href="#"
                            class="icon-valid"
                            :data-user="notification.map.id"
                            data-toggle="modal"
                            data-target="#limitedEditBeatmap"
                            @click.prevent="selectBeatmap()"
                        ><i class="far fa-window-maximize" /></a>
                    </span>

                    <span v-if="notification.party">for quest "{{ notification.quest.name }}" <a
                        href="#"
                        class="icon-valid"
                        :data-user="notification.party.id"
                        data-toggle="modal"
                        data-target="#limitedEditParty"
                        @click.prevent="selectParty()"
                    ><i class="far fa-window-maximize" /></a></span>
                </p>
            </div>

            <div class="card-footer notification-card-spacing mx-2">
                <span class="card-text small">{{ notification.createdAt.slice(0,10) }}</span>
                <button class="btn btn-outline-info notification-button float-right" @click.prevent="hideNotification($event)">
                    Mark as read
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'NotificationCard',
    props: {
        notification: {
            type: Object,
            required: true,
        },
    },
    methods: {
        hideNotification (e): void {
            this.$emit('hide-notification', { id: this.notification.id, e });
        },
        selectBeatmap (): void {
            this.$emit('update:selectedMap', this.notification.map);
        },
        selectParty (): void {
            this.$emit('update:selectedParty', this.notification.party);
        },
    },
});
</script>
