<template>
    <div>
        <div class="container card card-body py-3">
            <h5>Add user manually</h5>
            <div class="text-secondary">
                This adds a user to the Mappers' Guild database given a username and osu ID.
            </div>
            <div class="input-group w-50">
                <input
                    v-model.number="usernameInput"
                    class="form-control form-control-sm"
                    autocomplete="off"
                    placeholder="username..."
                />
                <input
                    v-model.number="osuIdInput"
                    class="form-control form-control-sm"
                    autocomplete="off"
                    placeholder="osuId..."
                />
                <div class="input-group-append">
                    <button
                        class="btn btn-primary"
                        href="#"
                        @click.prevent="addUserManually($event)"
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
import { mapState } from 'vuex';
import mentorshipModule from '@store/mentorship';

export default defineComponent({
    name: 'AddUserManually',
    components: {
    },
    data () {
        return {
            usernameInput: null,
            osuIdInput: null,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
    },
    beforeCreate () {
        if (!this.$store.hasModule('mentorship')) {
            this.$store.registerModule('mentorship', mentorshipModule);
        }
    },
    methods: {
        async addUserManually(e): Promise<void> {
            const user: any = await this.$http.executePost(`/mentorship/addUserManually`, { usernameInput: this.usernameInput, osuIdInput: this.osuIdInput }, e);

            if (!this.$http.isError(user)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Added ${user.username}`,
                    type: 'info',
                });
            }
        },
    },
});
</script>
