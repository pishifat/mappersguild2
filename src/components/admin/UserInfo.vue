<template>
    <div id="editUser" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
            <div v-if="user" class="modal-content bg-dark">
                <div class="modal-header text-dark" :class="'bg-rank-' + user.rank">
                    <h5 class="modal-title">
                        <a :href="'https://osu.ppy.sh/users/' + user.osuId" class="text-dark" target="_blank">
                            {{ user.username }}
                        </a>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden">
                    <p>
                        <input
                            v-model="penaltyPoints"
                            class="form-control-sm mx-2"
                            type="text"
                            autocomplete="off"
                        >
                        <button class="btn btn-sm btn-outline-info" @click="updatePenaltyPoints($event)">
                            Save penalty points
                        </button>
                    </p>
                    <p>
                        <input
                            v-model="spentPoints"
                            class="form-control-sm mx-2"
                            type="text"
                            autocomplete="off"
                        >
                        <button class="btn btn-sm btn-outline-info" @click="updateSpentPoints($event)">
                            Save spent points
                        </button>
                    </p>
                    <p>
                        <input
                            v-model="badge"
                            class="form-control-sm mx-2"
                            type="text"
                            autocomplete="off"
                        >
                        <button class="btn btn-sm btn-outline-info" @click="updateBadge($event)">
                            Save badge
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { User } from '../../../interfaces/user';

export default Vue.extend({
    name: 'UserInfo',
    props: {
        user: {
            type: Object as () => User,
            default: null,
        },
    },
    data() {
        return {
            penaltyPoints: 0,
            spentPoints: 0,
            badge: 0,
        };
    },
    computed: {

    },
    watch: {
        user(): void {
            this.penaltyPoints = this.user.penaltyPoints || 0;
            this.spentPoints = this.user.spentPoints || 0;
            this.badge = this.user.badge || 0;
        },
    },
    methods: {
        async updatePenaltyPoints(e): Promise<void> {
            const penaltyPoints = await this.executePost(`/admin/users/${this.user.id}/updatePenaltyPoints`, { penaltyPoints: this.penaltyPoints }, e);

            if (!this.isError(penaltyPoints)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `set penalty points to ${penaltyPoints}`,
                    type: 'info',
                });
                this.$store.commit('updatePenaltyPoints', {
                    userId: this.user.id,
                    penaltyPoints,
                });
            }
        },
        async updateSpentPoints(e): Promise<void> {
            const spentPoints = await this.executePost(`/admin/users/${this.user.id}/updateSpentPoints`, { spentPoints: this.spentPoints }, e);

            if (!this.isError(spentPoints)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `set spent points to ${spentPoints}`,
                    type: 'info',
                });
                this.$store.commit('updateSpentPoints', {
                    userId: this.user.id,
                    spentPoints,
                });
            }
        },
        async updateBadge(e): Promise<void> {
            const badge = await this.executePost(`/admin/users/${this.user.id}/updateBadge`, { badge: this.badge }, e);

            if (badge) {
                this.$store.dispatch('updateToastMessages', {
                    message: `set badge to ${badge}`,
                    type: 'info',
                });
                this.$store.commit('updateBadge', {
                    userId: this.user.id,
                    badge,
                });
            }
        },
    },
});
</script>