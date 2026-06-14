<template>
    <div v-if="selfTeamInfo">
        <div class="row">
            <div class="col-sm-6">
                <div class="mb-2">
                    <div class="small">
                        Visibility
                        <div class="small text-secondary mb-1">
                            Toggle this for public display. Your listing is currently <i>{{ selfTeamInfo.isPublic ? 'visible' : 'not visible' }}</i>!
                        </div>
                        <button class="btn btn-sm btn-outline-info mb-2 w-100" @click="toggleIsPublic($event)">
                            {{ selfTeamInfo.isPublic ? 'Hide from public listing' : 'Show on public listing' }}
                        </button>
                    </div>
                </div>
                <div class="mb-2">
                    <div class="small">
                        Team status
                        <div class="small text-secondary mb-1">
                            Toggle this to show if you're already on a team. You are currently marked as <i>{{ selfTeamInfo.isOnTeam ? 'on a team' : 'not on a team' }}</i>!
                        </div>
                        <button class="btn btn-sm btn-outline-info mb-2 w-100" @click="toggleIsOnTeam($event)">
                            {{ selfTeamInfo.isOnTeam ? 'Mark as "not on a team"' : 'Mark as "on a team"' }}
                        </button>
                    </div>
                </div>
                <div class="mb-2">
                    <div class="small">
                        Roles
                        <div class="small text-secondary">
                            What roles best describe you? Feel free to elaborate in "about" section
                        </div>
                        <div class="input-group">
                            <select
                                v-model="newRole"
                                class="form-control form-control-sm ml-2"
                            >
                                <option value="" selected disabled>
                                    Select a role
                                </option>
                                <option
                                    v-for="role in roleOptions"
                                    :key="role"
                                    :value="role"
                                    class="text-capitalize"
                                >
                                    {{ role }}
                                </option>
                            </select>
                            <div class="input-group-append">
                                <button
                                    v-if="!userRoles.includes(newRole)"
                                    :disabled="userRoles.includes(newRole)"
                                    class="btn btn-sm btn-outline-success"
                                    type="button"
                                    @click="updateRole($event)"
                                >
                                    <i class="fas fa-plus" />
                                </button>
                            </div>
                            <div class="input-group-append">
                                <button
                                    v-if="userRoles.includes(newRole)"
                                    :disabled="!userRoles.includes(newRole)"
                                    class="btn btn-sm btn-outline-danger"
                                    type="button"
                                    @click="updateRole($event)"
                                >
                                    <i class="fas fa-minus" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <hr />
                <div class="mb-2">
                    <div class="small">
                        Discord
                        <div class="small text-secondary">
                            Your Discord ID (if you want to communicate through Discord)
                        </div>
                        <input
                            v-model="newDiscord"
                            class="ml-1 form-control form-control-sm w-100"
                            placeholder="discord..."
                            maxlength="40"
                            @change="updateDiscord($event)"
                        />
                    </div>
                </div>
                <div class="mb-2">
                    <div class="small">
                        Email
                        <div class="small text-secondary">
                            Your email (if you want to communicate through email)
                        </div>
                        <input
                            v-model="newEmail"
                            class="ml-1 form-control form-control-sm w-100"
                            placeholder="email..."
                            maxlength="100"
                            @change="updateEmail($event)"
                        />
                    </div>
                </div>
                <div class="mb-2">
                    <div class="small">
                        Timezone
                        <div class="small text-secondary">
                            Relative to <a href="https://www.timeanddate.com/time/map/#!cities=1440" target="_blank">UTC</a>
                        </div>
                        <select
                            v-model="newTimezone"
                            class="form-select form-select-sm w-100 d-inline"
                            @change="updateTimezone($event)"
                        >
                            <option value="" selected disabled>
                                Select a timezone
                            </option>
                            <option
                                v-for="timezone in timezoneOptions"
                                :key="timezone"
                                :value="timezone"
                            >
                                {{ timezone }} UTC
                            </option>
                        </select>
                    </div>
                </div>
                <div class="mb-2">
                    <div class="small">
                        Availability
                        <div class="small text-secondary">
                            When you're usually available
                        </div>
                        <input
                            v-model="newAvailability"
                            class="ml-1 form-control form-control-sm w-100"
                            placeholder="availability..."
                            maxlength="400"
                            @change="updateAvailability($event)"
                        />
                    </div>
                </div>
                <div class="mb-2">
                    <div class="small">
                        Languages
                        <div class="small text-secondary">
                            Any languages you're comfortable communicating with (excluding English)
                        </div>
                        <div class="input-group">
                            <select
                                v-model="newLanguage"
                                class="form-control form-control-sm ml-2"
                            >
                                <option value="" selected disabled>
                                    Select a language
                                </option>
                                <option
                                    v-for="language in languageOptions"
                                    :key="language"
                                    :value="language"
                                    class="text-capitalize"
                                >
                                    {{ language }}
                                </option>
                            </select>
                            <div class="input-group-append">
                                <button
                                    v-if="!userLanguages.includes(newLanguage)"
                                    :disabled="userLanguages.includes(newLanguage)"
                                    class="btn btn-sm btn-outline-success"
                                    type="button"
                                    @click="updateLanguage($event)"
                                >
                                    <i class="fas fa-plus" />
                                </button>
                            </div>
                            <div class="input-group-append">
                                <button
                                    v-if="userLanguages.includes(newLanguage)"
                                    :disabled="!userLanguages.includes(newLanguage)"
                                    class="btn btn-sm btn-outline-danger"
                                    type="button"
                                    @click="updateLanguage($event)"
                                >
                                    <i class="fas fa-minus" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <hr />
                <div class="mb-2">
                    <div class="small">
                        About
                        <div class="small text-secondary">
                            Any info you'd like people to know about you, such as your preferred genres, mapping experience, or other relevant skills. This section also supports <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank">markdown</a>!
                        </div>
                        <textarea
                            v-model="newAbout"
                            length="4"
                            class="ml-1 form-control form-control-sm"
                            placeholder="about..."
                            maxlength="40000"
                            rows="4"
                            @change="updateAbout($event)"
                        />
                    </div>
                </div>
            </div>
            <div class="col-sm-6">
                <team-card
                    :team-info="selfTeamInfo"
                    :api-base="apiBase"
                    :store-module="storeModule"
                />

                <div class="text-danger small mt-3">
                    {{ !selfTeamInfo.isPublic ? 'Your info is currently hidden from public display.' : '' }}
                </div>
            </div>
        </div>
        <hr />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import TeamCard from '@components/teamContest/TeamCard.vue';

export default defineComponent({
    name: 'SelfTeamInfo',
    components: {
        TeamCard,
    },
    props: {
        apiBase: {
            type: String,
            required: true,
        },
        storeModule: {
            type: String,
            required: true,
        },
        roleOptions: {
            type: Array,
            required: true,
        },
    },
    data () {
        return {
            timezoneOptions: ['-11', '-10', '-9', '-8', '-7', '-6', '-5', '-4', '-3:30', '-3', '-2', '-1', '+0', '+1', '+2', '+3', '+4', '+5', '+6', '+7', '+8', '+9', '+10', '+11', '+12'],
            languageOptions: ['afrikaans', 'arabic', 'belarusian', 'cantonese', 'catalan', 'chinese', 'danish', 'dutch', 'filipino', 'finnish', 'french', 'galician', 'german', 'indonesian', 'italian', 'japanese', 'korean', 'lithuanian', 'malay', 'polish', 'portuguese', 'romanian', 'russian', 'serbian', 'spanish', 'swedish', 'thai', 'turkish', 'urdu', 'vietnamese'],
            newTimezone: '',
            newAvailability: '',
            newLanguage: '',
            newRole: '',
            newDiscord: '',
            newEmail: '',
            newAbout: '',
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        selfTeamInfo() {
            return this.$store.state[this.storeModule].selfTeamInfo;
        },
        userLanguages() {
            if (this.selfTeamInfo && this.selfTeamInfo.languages && this.selfTeamInfo.languages.length) {
                return this.selfTeamInfo.languages;
            }

            return [];
        },
        userRoles() {
            if (this.selfTeamInfo && this.selfTeamInfo.roles && this.selfTeamInfo.roles.length) {
                return this.selfTeamInfo.roles;
            }

            return [];
        },
    },
    watch: {
        selfTeamInfo(): void {
            this.newTimezone = this.selfTeamInfo.timezone;
            this.newAvailability = this.selfTeamInfo.availability;
            this.newDiscord = this.selfTeamInfo.discord;
            this.newEmail = this.selfTeamInfo.email;
            this.newAbout = this.selfTeamInfo.about;
        },
    },
    methods: {
        async updateTimezone(e): Promise<void> {
            const timezone = await this.$http.executePost(`${this.apiBase}/${this.selfTeamInfo.id}/updateTimezone`, { timezone: this.newTimezone }, e);

            if (!this.$http.isError(timezone)) {
                this.$store.dispatch('updateToastMessages', { message: `Updated timezone`, type: 'info' });
                this.$store.commit(`${this.storeModule}/updateTimezone`, timezone);
            }
        },
        async updateAvailability(e): Promise<void> {
            const availability = await this.$http.executePost(`${this.apiBase}/${this.selfTeamInfo.id}/updateAvailability`, { availability: this.newAvailability }, e);

            if (!this.$http.isError(availability)) {
                this.$store.dispatch('updateToastMessages', { message: `Updated availability`, type: 'info' });
                this.$store.commit(`${this.storeModule}/updateAvailability`, availability);
            }
        },
        async updateLanguage(e): Promise<void> {
            const language = await this.$http.executePost(`${this.apiBase}/${this.selfTeamInfo.id}/updateLanguage`, { language: this.newLanguage }, e);

            if (!this.$http.isError(language)) {
                this.$store.dispatch('updateToastMessages', { message: `Updated language`, type: 'info' });
                this.$store.commit(`${this.storeModule}/updateLanguage`, language);
            }
        },
        async updateRole(e): Promise<void> {
            const role = await this.$http.executePost(`${this.apiBase}/${this.selfTeamInfo.id}/updateRole`, { role: this.newRole }, e);

            if (!this.$http.isError(role)) {
                this.$store.dispatch('updateToastMessages', { message: `Updated role`, type: 'info' });
                this.$store.commit(`${this.storeModule}/updateRole`, role);
            }
        },
        async updateDiscord(e): Promise<void> {
            const discord = await this.$http.executePost(`${this.apiBase}/${this.selfTeamInfo.id}/updateDiscord`, { discord: this.newDiscord }, e);

            if (!this.$http.isError(discord)) {
                this.$store.dispatch('updateToastMessages', { message: `Updated discord`, type: 'info' });
                this.$store.commit(`${this.storeModule}/updateDiscord`, discord);
            }
        },
        async updateEmail(e): Promise<void> {
            const email = await this.$http.executePost(`${this.apiBase}/${this.selfTeamInfo.id}/updateEmail`, { email: this.newEmail }, e);

            if (!this.$http.isError(email)) {
                this.$store.dispatch('updateToastMessages', { message: `Updated email`, type: 'info' });
                this.$store.commit(`${this.storeModule}/updateEmail`, email);
            }
        },
        async updateAbout(e): Promise<void> {
            const about = await this.$http.executePost(`${this.apiBase}/${this.selfTeamInfo.id}/updateAbout`, { about: this.newAbout }, e);

            if (!this.$http.isError(about)) {
                this.$store.dispatch('updateToastMessages', { message: `Updated about`, type: 'info' });
                this.$store.commit(`${this.storeModule}/updateAbout`, about);
            }
        },
        async toggleIsPublic(e): Promise<void> {
            const isPublic = await this.$http.executePost(`${this.apiBase}/${this.selfTeamInfo.id}/toggleIsPublic`, {}, e);

            if (!this.$http.isError(isPublic)) {
                this.$store.dispatch('updateToastMessages', { message: `Updated public display`, type: 'info' });
                this.$store.commit(`${this.storeModule}/updateIsPublic`, isPublic);
            }
        },
        async toggleIsOnTeam(e): Promise<void> {
            const isOnTeam = await this.$http.executePost(`${this.apiBase}/${this.selfTeamInfo.id}/toggleIsOnTeam`, {}, e);

            if (!this.$http.isError(isOnTeam)) {
                this.$store.dispatch('updateToastMessages', { message: `Updated team status`, type: 'info' });
                this.$store.commit(`${this.storeModule}/updateIsOnTeam`, isOnTeam);
            }
        },
    },
});
</script>
