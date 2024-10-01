<template>
    <div>
        <div class="container card card-body py-3 mt-2">
            <h5>Tenure Badges</h5>
            <button
                v-if="!badgeUsers.length"
                class="btn btn-primary"
                href="#"
                @click.prevent="loadTenureBadges($event, null)"
            >
                Load badges
            </button>
            <ul v-else>
                <li v-for="user in badgeUsers" :key="user.id">
                    <user-link
                        :user="user"
                    />
                    <ul>
                        <li>
                            <span class="text-secondary">Badge:</span> <b>{{ user.mentorshipBadge }}</b>
                            <a href="#" :class="clicked ? 'fake-button-disable' : ''" @click.prevent="editBadgeValue(user._id, true)"><i class="fas fa-plus ms-1 text-success" /></a>
                            <a href="#" :class="clicked ? 'fake-button-disable' : ''" @click.prevent="editBadgeValue(user._id, false)"><i class="fas fa-minus ms-1 text-danger" /></a>
                        </li>
                        <li>
                            <span class="text-secondary">Actual tenure:</span> <b>{{ user.actualTenure }}</b>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import mentorshipModule from '@store/mentorship';

export default defineComponent({
    name: 'TenureBadges',
    data () {
        return {
            clicked: false,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapGetters('mentorship', [
            'badgeUsers',
        ]),
    },
    beforeCreate () {
        if (!this.$store.hasModule('mentorship')) {
            this.$store.registerModule('mentorship', mentorshipModule);
        }
    },
    methods: {
        async loadTenureBadges(e): Promise<void> {
            const res: any = await this.$http.executeGet(`/mentorship/loadTenureBadges`, e);

            if (!this.$http.isError(res)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `loaded`,
                    type: 'info',
                });

                this.$store.commit('mentorship/setBadgeUsers', res.users);
            }
        },
        async editBadgeValue(userId, value): Promise<void> {
            this.clicked = true;
            const res: any = await this.$http.executePost(`/mentorship/editBadgeValue`, { userId, value });

            if (!this.$http.isError(res)) {
                await this.loadTenureBadges(null);
                this.$store.dispatch('updateToastMessages', {
                    message: `updated`,
                    type: 'info',
                });
            }

            this.clicked = false;
        },
    },
});
</script>

<style scoped>
.fake-button-disable {
    pointer-events: none;
    opacity: 0.6;
}
</style>