<template>
    <div>
        <div class="text-secondary">
            <div class="input-group input-group-sm w-50 mb-2">
                <input
                    v-model="userInput"
                    maxlength="15"
                    class="form-control form-control-sm"
                    autocomplete="off"
                    placeholder="..."
                    @keyup.enter="userInput.length && submitSecret($event)"
                    @click.stop
                />
                <button
                    class="btn"
                    :class="secretResponseType ? `btn-${secretResponseType}` : 'btn-primary'"
                    href="#"
                    :disabled="!userInput.length"
                    @click="submitSecret($event)"
                >
                    <i class="fa-solid fa-arrow-right" />
                </button>
            </div>
            <div v-if="secretResponseText">
                <code v-if="secretResponseText" class="d-block" :class="'text-' + secretResponseType">
                    {{ secretResponseText }}
                </code>
                <template v-if="secretText">
                    <code
                        v-for="(line, i) in secretTextLines"
                        :key="i"
                        class="d-block mt-2"
                        :class="'text-' + secretResponseType"
                        v-html="line"
                    />
                </template>
                <div v-if="momentumArtistLoaded" class="mt-2">
                    <code class="d-block mb-2" :class="'text-' + secretResponseType">Below are songs exclusive to you (and other <i>INSIDER</i>s). Do not reveal this information to anyone else.</code>
                    <code class="d-block mb-2" :class="'text-' + secretResponseType">Create and rank a map using any of these songs to fulfill your role.</code>
                    <code
                        v-for="song in momentumArtist.songs"
                        :key="song.id"
                        class="d-block"
                        :class="'text-' + secretResponseType"
                    >
                        -
                        <a
                            target="_blank"
                            :href="song.oszUrl"
                            class="code-link"
                            :class="'text-' + secretResponseType"
                        >
                            {{ song.artist }} - {{ song.title }}
                        </a>
                    </code>
                    <code class="d-block mt-2" :class="'text-' + secretResponseType">
                        <a
                            target="_blank"
                            :href="momentumArtist.oszTemplatesUrl"
                            class="code-link"
                            :class="'text-' + secretResponseType"
                        >
                            download all .osz files
                        </a>
                    </code>
                </div>
            </div>
            <div class="mt-2">
                <div v-if="mission.momentumSecretUsers && mission.momentumSecretUsers.length">
                    <code v-if="mission.momentumSecretUsers.length > 20" class="d-block">Status: <b>{{ mission.momentumSecretUsers.length }} users</b> know how to increase MOMENTUM. <b>{{ starterRoleCount || '...' }} users</b> have STARTER ROLES.</code>

                    <code v-else class="d-block">Status: <user-link-list :users="mission.momentumSecretUsers" use-grammar /> {{ mission.momentumSecretUsers.length > 1 ? 'know' : 'knows' }} how to increase MOMENTUM.</code>
                </div>
                <div v-else>
                    <code class="d-block">Status: <b>0 users</b> know how to increase MOMENTUM.</code>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { Mission } from '@interfaces/mission';
import UserLinkList from '@components/UserLinkList.vue';

export default defineComponent({
    name: 'Momentum',
    components: {
        UserLinkList,
    },
    props: {
        mission: {
            type: Object as () => Mission,
            required: true,
        },
    },
    data () {
        return {
            userInput: '',
            momentumArtist: null as any,
            momentumArtistLoaded: false,
            secretResponseText: '',
            secretResponseType: '',
            secretText: '',
            starterRoleCount: 0,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        secretTextLines(): string[] {
            return this.secretText
                .split('\n')
                .map(line => this.$md.renderInline(line));
        },
    },
    async mounted(): Promise<void> {
        const starterRoleCount: any = await this.$http.executeGet('/missions/momentumStarterRoleCount');

        if (!this.$http.isError(starterRoleCount)) {
            this.starterRoleCount = starterRoleCount;
        }
    },
    methods: {
        async submitSecret(e): Promise<void> {
            this.momentumArtistLoaded = false;
            this.secretResponseText = '';
            this.secretText = '';
            const secretResponse: any = await this.$http.executePost(`/missions/${this.mission.id}/submitSecret`, { userInput: this.userInput }, e);

            if (!this.$http.isError(secretResponse)) {
                this.secretResponseText = secretResponse.text;
                this.secretResponseType = secretResponse.type;
                this.secretText = secretResponse.secretText || '';
                this.userInput = '';

                if (secretResponse.mission) {
                    this.$store.commit('missions/updateMission', secretResponse.mission);
                }

                if (secretResponse.action === 'insider') {
                    await this.findMomentumArtist();
                }
            }
        },
        async findMomentumArtist(): Promise<void> {
            this.momentumArtistLoaded = false;
            const momentumArtist: any = await this.$http.executeGet(`/missions/${this.mission.id}/findMomentumArtist`);

            if (!this.$http.isError(momentumArtist)) {
                this.momentumArtist = momentumArtist.artist;
            }

            if (momentumArtist.unlocked) {
                this.momentumArtistLoaded = true;
            }
        },
    },
});
</script>

<style scoped>
.btn-xs {
    padding: 0.1rem 0.4rem;
    font-size: 0.72rem;
    line-height: 1.4;
    border-radius: 0.2rem;
}

.song-title {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.code-link:hover {
    color: white !important;
}
</style>
