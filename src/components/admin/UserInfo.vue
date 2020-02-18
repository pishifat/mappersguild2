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
            badge: 0,
        };
    },
    computed: {

    },
    watch: {
        user(): void {
            this.penaltyPoints = this.user.penaltyPoints || 0;
            this.badge = this.user.badge || 0;
        },
    },
    methods: {
        async updatePenaltyPoints(e): Promise<void> {
            const u = await this.executePost(`/admin/users/${this.user.id}/updatePenaltyPoints`, { penaltyPoints: this.penaltyPoints }, e);

            if (u) {
                this.$emit('update-user', u);
            }
        },
        async updateBadge(e): Promise<void> {
            const u = await this.executePost(`/admin/users/${this.user.id}/updateBadge`, { badge: this.badge }, e);

            if (u) {
                this.$emit('update-user', u);
            }
        },
    },
});
</script>