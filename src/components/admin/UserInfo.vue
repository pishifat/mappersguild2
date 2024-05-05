<template>
    <modal-dialog
        :id="`editUser${currentGroup}`"
        :header-class="user ? 'bg-rank-' + user.rank : ''"
        :loaded="Boolean(user)"
    >
        <template #header>
            <user-link :user="user" />
        </template>

        <template #default>
            <div class="container">
                <h6>
                    Groups/permissions
                </h6>
                <div class="row mb-2">
                    <select v-model="group" class="form-select form-select-sm w-50 mx-2">
                        <option value="user">
                            User
                        </option>
                        <option value="admin">
                            Admin
                        </option>
                        <option value="secret">
                            Secret
                        </option>
                    </select>
                    <button class="btn btn-sm btn-outline-info w-25" @click="updateGroup($event)">
                        Save group
                    </button>
                </div>
                <div class="row mb-2">
                    <div class="col-sm-4">
                        <button class="btn btn-sm btn-outline-info w-100" @click="toggleIsShowcaseMapper($event)">
                            {{ user.isShowcaseMapper ? 'Disable' : 'Enable' }} isShowcaseMapper
                        </button>
                    </div>
                    <div class="col-sm-4">
                        <button class="btn btn-sm btn-outline-info w-100" @click="toggleIsMentorshipAdmin($event)">
                            {{ user.isMentorshipAdmin ? 'Disable' : 'Enable' }} isMentorshipAdmin
                        </button>
                    </div>
                    <div class="col-sm-4">
                        <button class="btn btn-sm btn-outline-info w-100" @click="toggleIsWorldCupHelper($event)">
                            {{ user.isWorldCupHelper ? 'Disable' : 'Enable' }} isWorldCupHelper
                        </button>
                    </div>
                </div>
                <h6 class="mt-4">
                    Rewards
                </h6>
                <div class="mb-2">
                    <button class="btn btn-sm btn-outline-info w-100" @click="calculateUserPoints($event)">
                        Calculate user points
                    </button>
                </div>
                <div class="row mb-2">
                    <input
                        v-model="queuedBadge"
                        class="form-control form-control-sm mx-2 w-50"
                        type="text"
                        autocomplete="off"
                    />
                    <button class="btn btn-sm btn-outline-info w-25" @click="updateQueuedBadge($event)">
                        Queue badge
                    </button>
                </div>
                <div class="row mb-2">
                    <input
                        v-model="badge"
                        class="form-control form-control-sm mx-2 w-50"
                        type="text"
                        autocomplete="off"
                    />
                    <button class="btn btn-sm btn-outline-info w-25" @click="updateBadge($event)">
                        Update actual badge
                    </button>
                </div>
                <h6 class="mt-4">
                    Merch
                </h6>
                <div class="row mb-2">
                    <div class="col-sm-4">
                        <button class="btn btn-sm btn-outline-info w-100" @click="toggleHasMerchAccess($event)">
                            hasMerchAccess: {{ user.hasMerchAccess }}
                        </button>
                    </div>
                    <div class="col-sm-4">
                        <button class="btn btn-sm btn-outline-info w-100" @click="toggleHasSpecificMerchOrder($event)">
                            hasSpecificMerchOrder: {{ user.hasSpecificMerchOrder }}
                        </button>
                    </div>
                    <div class="col-sm-4">
                        <button class="btn btn-sm btn-outline-info w-100" @click="toggleWorldCupMerchActive($event)">
                            worldCupMerch.active: {{ user.worldCupMerch.active ? 'true' : 'false' }}
                        </button>
                    </div>
                </div>
                <div v-if="user.worldCupMerch.active">
                    <div class="row">
                        <div class="col-sm-6 row mb-2">
                            <div class="col-sm-5">
                                coins:
                            </div>
                            <div class="col-sm-7">
                                <input
                                    v-model="coins"
                                    class="form-control form-control-sm mx-2 mb-2"
                                    type="text"
                                    placeholder="comma separated years"
                                    autocomplete="off"
                                />
                            </div>
                            <div class="col-sm-5">
                                pin:
                            </div>
                            <div class="col-sm-7">
                                <input
                                    v-model="pin"
                                    class="form-control form-control-sm mx-2 mb-2"
                                    type="text"
                                    placeholder="empty for false"
                                    autocomplete="off"
                                />
                            </div>
                            <div class="col-sm-5">
                                sweater:
                            </div>
                            <div class="col-sm-7">
                                <input
                                    v-model="sweater"
                                    class="form-control form-control-sm mx-2 mb-2"
                                    type="number"
                                    placeholder="year"
                                    autocomplete="off"
                                />
                            </div>
                            <div class="col-sm-5">
                                additionalItems:
                            </div>
                            <div class="col-sm-7">
                                <input
                                    v-model="additionalItems"
                                    class="form-control form-control-sm mx-2 mb-2"
                                    type="number"
                                    placeholder="usually 0, possibly 1 or 2"
                                    autocomplete="off"
                                />
                            </div>
                            <button class="btn btn-sm btn-outline-info" @click="saveWorldCupMerch($event)">
                                Save worldCupMerch
                            </button>
                        </div>
                        <copy-paste class="col-sm-6">
                            <pre>{{ user.worldCupMerch }}</pre>
                        </copy-paste>
                    </div>
                </div>

                <h6 class="mt-4">
                    Other
                </h6>
                <div class="row mb-2">
                    <input
                        v-model="discordId"
                        class="form-control form-control-sm mx-2 w-50"
                        type="text"
                        autocomplete="off"
                    />
                    <button class="btn btn-sm btn-outline-info w-25" @click="updateDiscordId($event)">
                        Save Discord ID
                    </button>
                </div>
                <div class="ms-2 mb-2">
                    <a href="#debug" data-bs-toggle="collapse" @click.prevent>
                        Debug
                        <i class="fas fa-angle-down" />
                    </a>
                </div>

                <div id="debug" class="collapse">
                    <copy-paste>
                        <pre>{{ user }}</pre>
                    </copy-paste>
                </div>
            </div>
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import ModalDialog from '@components/ModalDialog.vue';
import { defineComponent } from 'vue';
import { User } from '../../../interfaces/user';
import CopyPaste from '@components/CopyPaste.vue';

export default defineComponent({
    name: 'UserInfo',
    components: {
        ModalDialog,
        CopyPaste,
    },
    props: {
        user: {
            type: Object as () => User,
            default: null,
        },
        currentGroup: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            badge: 0,
            queuedBadge: 0,
            discordId: '',
            group: '',
            coins: '',
            pin: '',
            sweater: '',
            additionalItems: '',
        };
    },
    watch: {
        user(): void {
            this.badge = this.user.badge || 0;
            this.queuedBadge = this.user.queuedBadge || 0;
            this.discordId = this.user.discordId || '';
            this.group = this.user.group || '';
        },
    },
    created() {
        if (this.user) {
            this.badge = this.user.badge || 0;
            this.queuedBadge = this.user.badge || 0;
            this.discordId = this.user.discordId || '';
            this.group = this.user.group || '';
        }
    },
    methods: {
        async updateGroup(e): Promise<void> {
            const group = await this.$http.executePost(`/admin/users/${this.user.id}/updateGroup`, { group: this.group }, e);

            if (group) {
                this.$store.dispatch('updateToastMessages', {
                    message: `set group to ${group}`,
                    type: 'info',
                });
                this.$store.commit('updateGroup', {
                    userId: this.user.id,
                    group,
                });
            }
        },
        async updateQueuedBadge(e): Promise<void> {
            const badge = await this.$http.executePost(`/admin/users/${this.user.id}/updateQueuedBadge`, { badge: this.queuedBadge }, e);

            if (badge) {
                this.$store.dispatch('updateToastMessages', {
                    message: `set queued badge to ${badge}`,
                    type: 'info',
                });
                this.$store.commit('updateQueuedBadge', {
                    userId: this.user.id,
                    badge,
                });
            }
        },
        async updateBadge(e): Promise<void> {
            const badge = await this.$http.executePost(`/admin/users/${this.user.id}/updateBadge`, { badge: this.badge }, e);

            if (badge) {
                this.$store.dispatch('updateToastMessages', {
                    message: `set actual badge to ${badge}`,
                    type: 'info',
                });
                this.$store.commit('updateBadge', {
                    userId: this.user.id,
                    badge,
                });
            }
        },
        async updateDiscordId(e): Promise<void> {
            const discordId = await this.$http.executePost(`/admin/users/${this.user.id}/updateDiscordId`, { discordId: this.discordId }, e);

            if (discordId) {
                this.$store.dispatch('updateToastMessages', {
                    message: `set discord ID to ${discordId}`,
                    type: 'info',
                });
                this.$store.commit('updateDiscordId', {
                    userId: this.user.id,
                    discordId,
                });
            }
        },
        async calculateUserPoints(e): Promise<void> {
            const points = await this.$http.executePost(`/admin/users/${this.user.id}/calculateUserPoints`, {}, e);

            if (points) {
                this.$store.dispatch('updateToastMessages', {
                    message: `calculated points`,
                    type: 'info',
                });
            }
        },
        async toggleIsShowcaseMapper(e): Promise<void> {
            const res: any = await this.$http.executePost(`/admin/users/${this.user.id}/toggleIsShowcaseMapper`, { isShowcaseMapper: !this.user.isShowcaseMapper }, e);

            if (res) {
                this.$store.dispatch('updateToastMessages', {
                    message: `set isShowcaseMapper ${res.isShowcaseMapper}`,
                    type: 'info',
                });
                this.$store.commit('updateIsShowcaseMapper', {
                    userId: this.user.id,
                    isShowcaseMapper: res.isShowcaseMapper,
                });
            }
        },
        async toggleIsMentorshipAdmin(e): Promise<void> {
            const res: any = await this.$http.executePost(`/admin/users/${this.user.id}/toggleIsMentorshipAdmin`, { isMentorshipAdmin: !this.user.isMentorshipAdmin }, e);

            if (res) {
                this.$store.dispatch('updateToastMessages', {
                    message: `set isMentorshipAdmin ${res.isMentorshipAdmin}`,
                    type: 'info',
                });
                this.$store.commit('updateIsMentorshipAdmin', {
                    userId: this.user.id,
                    isMentorshipAdmin: res.isMentorshipAdmin,
                });
            }
        },
        async toggleIsWorldCupHelper(e): Promise<void> {
            const res: any = await this.$http.executePost(`/admin/users/${this.user.id}/toggleIsWorldCupHelper`, { isWorldCupHelper: !this.user.isWorldCupHelper }, e);

            if (res) {
                this.$store.dispatch('updateToastMessages', {
                    message: `set isWorldCupHelper ${res.isWorldCupHelper}`,
                    type: 'info',
                });
                this.$store.commit('updateIsWorldCupHelper', {
                    userId: this.user.id,
                    isWorldCupHelper: res.isWorldCupHelper,
                });
            }
        },
        async toggleHasMerchAccess(e): Promise<void> {
            const res: any = await this.$http.executePost(`/admin/users/${this.user.id}/toggleHasMerchAccess`, { hasMerchAccess: !this.user.hasMerchAccess }, e);

            if (res) {
                this.$store.dispatch('updateToastMessages', {
                    message: `set hasMerchAccess ${res.hasMerchAccess}`,
                    type: 'info',
                });
                this.$store.commit('updateHasMerchAccess', {
                    userId: this.user.id,
                    hasMerchAccess: res.hasMerchAccess,
                });
            }
        },
        async toggleHasSpecificMerchOrder(e): Promise<void> {
            const res: any = await this.$http.executePost(`/admin/users/${this.user.id}/toggleHasSpecificMerchOrder`, { hasSpecificMerchOrder: !this.user.hasSpecificMerchOrder }, e);

            if (res) {
                this.$store.dispatch('updateToastMessages', {
                    message: `set hasSpecificMerchOrder ${res.hasSpecificMerchOrder}`,
                    type: 'info',
                });
                this.$store.commit('updateHasSpecificMerchOrder', {
                    userId: this.user.id,
                    hasSpecificMerchOrder: res.hasSpecificMerchOrder,
                });
            }
        },
        async toggleWorldCupMerchActive(e): Promise<void> {
            const res: any = await this.$http.executePost(`/admin/users/${this.user.id}/toggleWorldCupMerchActive`, { active: !this.user.worldCupMerch.active }, e);

            if (res) {
                this.$store.dispatch('updateToastMessages', {
                    message: `set worldCupMerch.active ${res.worldCupMerch.active}`,
                    type: 'info',
                });
                this.$store.commit('updateWorldCupMerch', {
                    userId: this.user.id,
                    worldCupMerch: res.worldCupMerch,
                });
            }
        },
        async saveWorldCupMerch(e): Promise<void> {
            const res: any = await this.$http.executePost(`/admin/users/${this.user.id}/saveWorldCupMerch`, {
                worldCupMerch: {
                    coins: this.coins,
                    pin: this.pin,
                    sweater: this.sweater,
                    additionalItems: this.additionalItems,
                },
            }, e);

            if (res) {
                this.$store.dispatch('updateToastMessages', {
                    message: `saved worldCupMerch`,
                    type: 'info',
                });
                this.$store.commit('updateWorldCupMerch', {
                    userId: this.user.id,
                    worldCupMerch: res.worldCupMerch,
                });
            }
        },
    },
});
</script>