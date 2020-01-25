<template>
    <div
        class="bg-dark pl-3"
        style="
        position: fixed;
        z-index: 1060;
        bottom: 20px;
        right: 20px;
        border-radius: 100px;"
    >
        <a href="/notifications">
            <i class="fas fa-bell">
                <small class="notification-label">{{ notifications }}</small>
            </i>
            <i class="fas fa-at">
                <small class="notification-label">{{ invites }}</small>
            </i>
        </a>

        <a
            href="#top"
            class="btn btn-secondary fas fa-angle-up fa-2x"
            style="
            background-color: var(--done);
            border-color: var(--done);
            filter: drop-shadow(1px 1px 1px #000000);
            border-radius: 10000px;"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Axios from 'axios';

export default Vue.extend({
    data () {
        return {
            notifications: null,
            invites: null,
        };
    },
    created () {
        Axios
            .get('/notifications/relevantInfo')
            .then(response => {
                this.notifications = response.data.notifications.length;
                this.invites = response.data.invites.length;
            });
    },
    mounted () {
        setInterval(() => {
            Axios
                .get('/notifications/relevantInfo')
                .then(response => {
                    this.notifications = response.data.notifications.length;
                    this.invites = response.data.invites.length;
                });
        }, 300000);
    },
});
</script>

<style>
    .notification-label {
        font-family: 'Roboto', sans-serif;
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
