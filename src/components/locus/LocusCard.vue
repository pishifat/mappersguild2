<template>
    <div v-if="locusInfo" class="position-relative" :class="locusInfo.isOnTeam ? 'on-team opacity-50' : ''">
        <button v-if="isAdmin" class="btn btn-sm btn-outline-danger top-right-button" @click="adminToggleIsOnTeam($event)">
            {{ locusInfo.isOnTeam ? 'Mark as "not on a team"' : 'Mark as "on a team"' }}
        </button>
        <div v-if="locusInfo.isOnTeam" class="on-team-text fs-1 pointer-events-none">
            Joined a team
        </div>
        <div
            class="card card-level-2 card-body my-2"
            :class="locusInfo.isOnTeam ? 'pointer-events-none' : ''"
        >
            <img :src="'https://a.ppy.sh/' + locusInfo.user.osuId" class="card-avatar-img" />

            <div class="ms-3 mt-1 mb-1">
                <user-link class="ms-2" :user="locusInfo.user" />
            </div>
            <div class="ms-3">
                <i v-if="locusInfo.roles && locusInfo.roles.length" class="ms-2 text-secondary text-capitalize">{{ locusInfo.roles.join(', ') }}</i>
                <i v-else class="ms-2 text-secondary">No roles selected</i>
            </div>

            <hr v-if="locusInfo.timezone || locusInfo.availability || (locusInfo.languages && locusInfo.languages.length) || locusInfo.discord" class="mb-3" />

            <div v-if="locusInfo.discord || locusInfo.email" class="small">
                <div v-if="locusInfo.discord && locusInfo.discord.length && locusInfo.email && locusInfo.email.length">
                    Discord: <span class="text-secondary"><i>{{ locusInfo.discord ? locusInfo.discord : 'Discord ID' }} ({{ locusInfo.email }})</i></span>
                </div>
                <div v-else-if="locusInfo.discord && locusInfo.discord.length">
                    Discord: <span class="text-secondary"><i>{{ locusInfo.discord ? locusInfo.discord : 'Discord ID' }}</i></span>
                </div>
                <div v-else-if="!locusInfo.discord && !locusInfo.discord.length && locusInfo.email && locusInfo.email.length" class="ms-2">
                    Email: <span class="text-secondary"><i>{{ locusInfo.email }}</i></span>
                </div>
            </div>

            <div v-if="locusInfo.timezone" class="small">
                Timezone:
                <i class="text-secondary">
                    {{ locusInfo.timezone }}
                    <a href="https://www.timeanddate.com/time/map/#!cities=1440" target="_blank">UTC</a>
                </i>
            </div>

            <div v-if="locusInfo.availability" class="small">
                Availability: <i class="text-secondary">{{ locusInfo.availability }}</i>
            </div>

            <div v-if="locusInfo.languages && locusInfo.languages.length" class="small">
                Languages: <i class="text-secondary text-capitalize">English, {{ locusInfo.languages.join(', ') }}</i>
            </div>

            <hr v-if="locusInfo.about" />

            <div v-if="locusInfo.about" class="small">
                <span class="text-secondary" v-html="$md.render(locusInfo.about.trim())" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { LocusInfo } from '../../../interfaces/locusInfo';
import { UserGroup } from '../../../interfaces/user';

export default defineComponent({
    name: 'LocusCard',
    props: {
        locusInfo: {
            type: Object as () => LocusInfo,
            required: true,
        },
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        isAdmin() {
            return this.loggedInUser.group == UserGroup.Admin || this.loggedInUser.group == UserGroup.Locus;
        },
    },
    methods: {
        async adminToggleIsOnTeam(e): Promise<void> {
            const isOnTeam = await this.$http.executePost(`/locus/${this.locusInfo.id}/toggleIsOnTeam`, {}, e);

            if (!this.$http.isError(isOnTeam)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated team status`,
                    type: 'info',
                });
                this.$store.commit('locus/adminUpdateIsOnTeam', { isOnTeam, id: this.locusInfo.id });
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
