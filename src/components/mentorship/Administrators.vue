<template>
    <div>
        <div class="container card card-body py-3">
            <h5>Mentorship Administrators</h5>
            <div class="text-secondary">
                Users with access to mentorship tools:
            </div>
            <ul>
                <li v-for="user in allAdmins" :key="user.id">
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
                        @click.prevent="toggleIsMentorshipAdmin($event, user.id)"
                    >
                        confirm
                    </a>
                </li>
            </ul>
            <div class="input-group w-25">
                <input
                    v-model.number="userInput"
                    class="form-control form-control-sm"
                    autocomplete="off"
                    placeholder="new admin username/osuId..."
                    @keyup.enter="toggleIsMentorshipAdmin($event, null)"
                />
                <div class="input-group-append">
                    <button
                        class="btn btn-primary"
                        href="#"
                        @click.prevent="toggleIsMentorshipAdmin($event, null)"
                    >
                        <i class="fas fa-plus fa-xs" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import mentorshipModule from '@store/mentorship';

export default defineComponent({
    name: 'Administrators',
    components: {
    },
    data () {
        return {
            userInput: null,
            confirmDelete: null,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapGetters('mentorship', [
            'allAdmins',
        ]),
    },
    beforeCreate () {
        if (!this.$store.hasModule('mentorship')) {
            this.$store.registerModule('mentorship', mentorshipModule);
        }
    },
    methods: {
        async toggleIsMentorshipAdmin(e, userId): Promise<void> {
            const user: any = await this.$http.executePost(`/mentorship/toggleIsMentorshipAdmin`, { userInput: this.userInput, userId }, e);

            if (!this.$http.isError(user)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `${user.isMentorshipAdmin ? 'Added' : 'Removed'}`,
                    type: 'info',
                });

                if (user.isMentorshipAdmin) {
                    const currentAdmins = [...this.allAdmins];
                    currentAdmins.push(user);
                    this.$store.commit('mentorship/setAdmins', currentAdmins);
                } else {
                    this.$store.commit('mentorship/removeAdmin', userId);
                }
            }
        },
    },
});
</script>
