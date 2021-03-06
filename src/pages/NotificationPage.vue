<template>
    <div>
        <div class="container card card-body py-3 mb-2">
            <div class="row">
                <div class="col-md-6">
                    <h2>
                        Notifications
                        <button class="btn btn-outline-info btn-sm ms-1" @click.prevent="hideAll($event)">
                            Mark all as read
                        </button>
                    </h2>
                    <transition-group name="list" tag="div" class="row">
                        <notification-card
                            v-for="notification in notifications"
                            :key="notification.id"
                            :notification="notification"
                            @update:selectedMap="selectedMap = $event"
                            @update:selectedParty="selectedParty = $event"
                            @hide-notification="hideNotification($event)"
                        />
                    </transition-group>
                    <p v-if="!notifications.length" class="ms-4">
                        No notifications...
                    </p>
                </div>

                <div class="col-md-6">
                    <h2>
                        Invites
                        <button class="btn btn-outline-danger btn-sm ms-1" @click.prevent="declineAll($event)">
                            Decline all
                        </button>
                    </h2>
                    <transition-group name="list" tag="div" class="row">
                        <invite-card
                            v-for="invite in invites"
                            :key="invite.id"
                            :invite="invite"
                            @update:info="info = $event"
                            @update:selectedMap="selectedMap = $event"
                            @update:selectedParty="selectedParty = $event"
                            @hideInvite="hideInvite($event)"
                            @acceptInvite="acceptInvite($event)"
                        />
                    </transition-group>
                    <p v-if="!invites.length" class="ms-4">
                        No invites...
                    </p>
                </div>
            </div>
        </div>

        <limited-map-info v-if="selectedMap" :beatmap="selectedMap" />
        <limited-party-info v-if="selectedParty" :party="selectedParty" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NotificationCard from '@components/notifications/NotificationCard.vue';
import InviteCard from '@components/notifications/InviteCard.vue';
import LimitedMapInfo from '@components/notifications/LimitedMapInfo.vue';
import LimitedPartyInfo from '@components/notifications/LimitedPartyInfo.vue';
import { Notification } from '../../interfaces/notification';
import { Invite } from '../../interfaces/invite';

export default defineComponent({
    name: 'NotificationPage',
    components: {
        NotificationCard,
        InviteCard,
        LimitedMapInfo,
        LimitedPartyInfo,
    },
    data() {
        return {
            notifications: [] as Notification[],
            invites: [] as Invite[],
            info: '',
            selectedMap: null,
            selectedParty: null,
        };
    },
    async created() {
        const res: any = await this.$http.initialRequest('/notifications/relevantInfo');

        if (res) {
            this.notifications = res.notifications;
            this.invites = res.invites;
        }
    },
    methods: {
        async hideNotification(args): Promise<void> {
            const id = args.id;
            const e = args.e;
            const i = this.notifications.findIndex(notif => notif.id === id);
            this.notifications.splice(i, 1);
            await this.$http.executePost(`/notifications/${id}/hide`, {}, e);
        },
        async hideAll(e): Promise<void> {
            this.notifications = [];
            await this.$http.executePost('/notifications/hideAll/', {}, e);
        },

        async hideInvite(args): Promise<void> {
            const id = args.id;
            const e = args.e;
            const i = this.invites.findIndex(inv => inv.id === id);
            this.invites.splice(i, 1);
            await this.$http.executePost(`/invites/${id}/hide`, {}, e);
        },
        async declineAll(e): Promise<void> {
            this.invites = [];
            await this.$http.executePost('/invites/declineAll/', {}, e);
        },
        async acceptInvite(args): Promise<void> {
            const id = args.id;
            const e = args.e;
            const invite = await this.$http.executePost(`/invites/${id}/accept`, {}, e);

            if (!this.$http.isError(invite)) {
                const i = this.invites.findIndex(inv => inv.id === id);
                this.invites.splice(i, 1);
            }
        },
    },
});
</script>
