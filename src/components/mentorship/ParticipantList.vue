<template>
    <div class="col-sm-3">
        <div class="text-center">
            <b>{{ mode == 'osu' ? 'osu!' : 'osu!' + mode }}</b>
        </div>
        <ul>
            <li v-for="user in users" :key="user.id">
                <user-link
                    :user="user"
                />
                <a
                    v-if="confirmDelete != user.id"
                    href="#"
                    class="text-danger"
                    @click.prevent="confirmDelete = user.id"
                >
                    delete
                </a>
                <a
                    v-else
                    class="text-danger"
                    href="#"
                    @click.prevent="removeParticipant($event, user.id)"
                >
                    confirm
                </a>
            </li>
        </ul>
        <div class="input-group">
            <input
                v-model="userInput"
                class="form-control form-control-sm"
                autocomplete="off"
                placeholder="new mentor username/osuId..."
                @keyup.enter="addParticipant($event)"
            />
            <div class="input-group-append">
                <button
                    class="btn btn-primary"
                    href="#"
                    @click.prevent="addParticipant($event)"
                >
                    <i class="fas fa-plus fa-xs" />
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { mapState, mapGetters } from 'vuex';
import mentorshipModule from '@store/mentorship';
import { User } from '@interfaces/user';

export default defineComponent({
    name: 'ParticipantList',
    props: {
        mode: {
            type: String,
            default: '',
        },
        group: {
            type: String,
            default: '',
        },
        users: {
            type: Array as PropType<User[]>,
            default: () => [],
        },
    },
    data () {
        return {
            userInput: null,
            confirmDelete: '',
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapGetters('mentorship', [
            'selectedCycle',
            'cycleOsuMentors',
            'cycleOsuMentees',
        ]),
    },
    beforeCreate () {
        if (!this.$store.hasModule('mentorship')) {
            this.$store.registerModule('mentorship', mentorshipModule);
        }
    },
    methods: {
        async addParticipant(e): Promise<void> {
            const cycle: any = await this.$http.executePost(`/mentorship/addParticipant`, { cycleId: this.selectedCycle.id, userInput: this.userInput, mode: this.mode, group: this.group }, e);

            if (!this.$http.isError(cycle)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Added "${this.userInput}"`,
                    type: 'info',
                });
                this.$store.commit('mentorship/updateCycle', cycle);
                this.userInput = null;
            }
        },
        async removeParticipant(e, userId): Promise<void> {
            const cycle: any = await this.$http.executePost(`/mentorship/removeParticipant`, { cycleId: this.selectedCycle.id, userId, mode: this.mode, group: this.group }, e);

            if (!this.$http.isError(cycle)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Removed user`,
                    type: 'info',
                });
                this.$store.commit('mentorship/updateCycle', cycle);
            }
        },
    },
});
</script>
