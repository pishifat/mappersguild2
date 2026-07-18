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
                    @keyup.enter="submitSecret($event)"
                    @click.stop
                />
                <button
                    class="btn"
                    :class="secretResponseType ? `btn-${secretResponseType}` : 'btn-primary'"
                    href="#"
                    @click="submitSecret($event)"
                >
                    <i class="fa-solid fa-arrow-right" />
                </button>
            </div>
            <div v-if="secretResponseText">
                <code v-if="secretResponseText" :class="'text-' + secretResponseType">
                    {{ secretResponseText }}
                </code>
                <div v-if="secretText" class="mt-2">
                    <code v-html="$md.renderInline(secretText)" />
                </div>
                <div v-if="(momentumArtistsLoaded && momentumArtists.unlocked) && !secretText" class="mt-2">
                    <code>Response: Below are artists exclusive to you (and other <i>Insiders</i>). Create and rank a map using any of these artists' listed songs to complete the quest.</code>
                    <ol>
                        <li v-for="featuredArtist in momentumArtists.artists" :key="featuredArtist.id"><a target="_blank" :href="featuredArtist.oszTemplatesUrl"><code>{{ featuredArtist.label }}</code></a></li>
                    </ol>
                </div>
                <div class="mt-2">
                    <div v-if="mission.momentumSecretUsers && mission.momentumSecretUsers.length">
                        <code>Status: <user-link-list :users="mission.momentumSecretUsers" use-grammar /> {{ mission.momentumSecretUsers.length > 1 ? 'know' : 'knows' }} how to increase momentum.</code>
                    </div>
                    <div v-else>
                        <code>Status: <b>0 users</b> know how to increase momentum.</code>
                    </div>
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
            momentumArtists: null as any,
            momentumArtistsLoaded: false,
            secretResponseText: '',
            secretResponseType: '',
            secretText: '',
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
    },
    async mounted(): Promise<void> {
        await this.findMomentumArtists();
    },
    methods: {
        async submitSecret(e): Promise<void> {
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

                await this.findMomentumArtists();
            }
        },
        async findMomentumArtists(): Promise<void> {
            this.momentumArtistsLoaded = false;
            const momentumArtists = await this.$http.executeGet(`/missions/${this.mission.id}/findMomentumArtists`);

            if (!this.$http.isError(momentumArtists)) {
                this.momentumArtists = momentumArtists;
            }

            if (this.momentumArtists.unlocked) {
                this.momentumArtistsLoaded = true;
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
</style>
