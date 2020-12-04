<template>
    <div
        class="bg-dark pl-3"
        style="
            position: fixed;
            z-index: 1060;
            bottom: 20px;
            right: 20px;
            border-radius: 100px;
        "
    >
        <router-link to="/notifications">
            <i class="fas fa-bell">
                <small class="notification-label">{{ notifications }}</small>
            </i>
            <i class="fas fa-at">
                <small class="notification-label">{{ invites }}</small>
            </i>
        </router-link>

        <a
            href="#top"
            class="btn btn-primary rounded-circle"
        >
            <i class="fas fa-angle-up fa-2x" />
        </a>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Axios from 'axios';

export default Vue.extend({
    data () {
        return {
            notifications: '..',
            invites: '..',
        };
    },
    async created () {
        const res: any = await Axios.get('/notifications/relevantInfo');

        if (res.data && !res.data.error) {
            this.notifications = res.data.notifications.length;
            this.invites = res.data.invites.length;
        }
    },
});
</script>

<style>
    .notification-label {
        font-family: 'Karla', sans-serif;
        position: relative;
        top: -8px;
        right: 5px;
        background: #ff5864;
        border-radius: 300px;
        border: #ff5864 1px 5px 1px 5px solid;
        border-left: 5px solid #ff5864;
        border-right: 5px solid #ff5864;
    }
</style>
