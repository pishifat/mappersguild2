<template>
    <div v-if="teamInfo" class="position-relative" :class="[teamInfo.isOnTeam ? 'on-team opacity-50' : '', teamInfo.isHiddenByAdmin ? 'opacity-50' : '']">
        <div v-if="isAdmin" class="top-right-button d-flex gap-2">
            <button class="btn btn-sm btn-outline-danger" @click="adminToggleIsOnTeam($event)">
                {{ teamInfo.isOnTeam ? 'Mark as "not on a team"' : 'Mark as "on a team"' }}
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="adminHideUser($event)">
                {{ teamInfo.isHiddenByAdmin ? 'Unhide' : 'Hide' }}
            </button>
        </div>
        <div v-if="teamInfo.isOnTeam" class="on-team-text fs-1 pointer-events-none">
            Joined a team
        </div>
        <div v-if="teamInfo.isHiddenByAdmin" class="on-team-text fs-1 pointer-events-none">
            Hidden by admin
        </div>
        <div
            class="card card-level-2 card-body my-2"
            :class="teamInfo.isOnTeam ? 'pointer-events-none' : ''"
        >
            <img :src="'https://a.ppy.sh/' + teamInfo.user.osuId" class="card-avatar-img" />

            <div class="ms-3 mt-1 mb-1">
                <user-link class="ms-2" :user="teamInfo.user" />
            </div>
            <div class="ms-3">
                <i v-if="teamInfo.roles && teamInfo.roles.length" class="ms-2 text-secondary text-capitalize">{{ teamInfo.roles.join(', ') }}</i>
                <i v-else class="ms-2 text-secondary">No roles selected</i>
            </div>

            <hr v-if="teamInfo.timezone || teamInfo.availability || (teamInfo.languages && teamInfo.languages.length) || teamInfo.discord" class="mb-3" />

            <div v-if="teamInfo.discord || teamInfo.email" class="small">
                <div v-if="teamInfo.discord && teamInfo.discord.length && teamInfo.email && teamInfo.email.length">
                    Discord: <span class="text-secondary"><i>{{ teamInfo.discord ? teamInfo.discord : 'Discord ID' }} ({{ teamInfo.email }})</i></span>
                </div>
                <div v-else-if="teamInfo.discord && teamInfo.discord.length">
                    Discord: <span class="text-secondary"><i>{{ teamInfo.discord ? teamInfo.discord : 'Discord ID' }}</i></span>
                </div>
                <div v-else-if="!teamInfo.discord && !teamInfo.discord.length && teamInfo.email && teamInfo.email.length" class="ms-2">
                    Email: <span class="text-secondary"><i>{{ teamInfo.email }}</i></span>
                </div>
            </div>

            <div v-if="teamInfo.timezone" class="small">
                Timezone:
                <i class="text-secondary">
                    {{ teamInfo.timezone }}
                    <a href="https://www.timeanddate.com/time/map/#!cities=1440" target="_blank">UTC</a>
                </i>
            </div>

            <div v-if="teamInfo.availability" class="small">
                Availability: <i class="text-secondary">{{ teamInfo.availability }}</i>
            </div>

            <div v-if="teamInfo.languages && teamInfo.languages.length" class="small">
                Languages: <i class="text-secondary text-capitalize">English, {{ teamInfo.languages.join(', ') }}</i>
            </div>

            <hr v-if="teamInfo.about" />

            <div v-if="teamInfo.about" class="small">
                <span class="text-secondary" v-html="$md.render(teamInfo.about.trim())" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { TeamInfo } from '../../../interfaces/teamInfo';
import { UserGroup } from '../../../interfaces/user';

export default defineComponent({
    name: 'TeamCard',
    props: {
        teamInfo: {
            type: Object as () => TeamInfo,
            required: true,
        },
        apiBase: {
            type: String,
            required: true,
        },
        storeModule: {
            type: String,
            required: true,
        },
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        isAdmin() {
            return this.loggedInUser.isTeamContestAdmin || this.loggedInUser.group == UserGroup.Admin;
        },
    },
    methods: {
        async adminToggleIsOnTeam(e): Promise<void> {
            const isOnTeam = await this.$http.executePost(`${this.apiBase}/${this.teamInfo.id}/toggleIsOnTeam`, {}, e);

            if (!this.$http.isError(isOnTeam)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated team status`,
                    type: 'info',
                });
                this.$store.commit(`${this.storeModule}/adminUpdateIsOnTeam`, { isOnTeam, id: this.teamInfo.id });
            }
        },
        async adminHideUser(e): Promise<void> {
            const isHiddenByAdmin = await this.$http.executePost(`${this.apiBase}/${this.teamInfo.id}/toggleIsHiddenByAdmin`, {}, e);

            if (!this.$http.isError(isHiddenByAdmin)) {
                this.$store.dispatch('updateToastMessages', {
                    message: isHiddenByAdmin ? `User hidden` : `User unhidden`,
                    type: 'info',
                });
                this.$store.commit(`${this.storeModule}/adminUpdateIsHiddenByAdmin`, { isHiddenByAdmin, id: this.teamInfo.id });
            }
        },
    },
});
</script>

<style scoped>
.card-avatar-img {
    position: absolute;
    top: 8px;
    left: 8px;
    max-width: 60px;
    max-height: 60px;
    object-fit: cover;
    border-radius: 5%;
    box-shadow: 0 1px 1rem rgb(10, 10, 25);
    background-color: rgb(10, 10, 25);
}

.card-body {
    padding: 0.5rem 1rem 0.5rem 3.5rem;
}

.card-header {
    padding: 0.5rem 1rem 0.5rem 3.5rem;
}

.on-team-text {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    z-index: 10;
}

.top-right-button {
    position: absolute;
    top: 20px;
    right: 25px;
    z-index: 10; /* Ensure it's above other content */
}

.pointer-events-none {
    pointer-events: none;
}
</style>
