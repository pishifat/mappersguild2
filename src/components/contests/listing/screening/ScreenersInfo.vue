<template>
    <div>
        <div class="input-group mb-2">
            <input
                v-model.number="screenerInput"
                class="form-control form-control-sm"
                autocomplete="off"
                placeholder="new screener username/osuId..."
                @keyup.enter="addScreener($event)"
            >
            <div class="input-group-append">
                <button
                    class="btn btn-primary"
                    href="#"
                    @click.prevent="addScreener($event)"
                >
                    <i class="fas fa-plus fa-xs" />
                </button>
            </div>
        </div>

        <ol v-if="screeners.length">
            <li
                v-for="screener in screeners"
                :key="screener.id"
            >
                <user-link :user="screener" />

                <a
                    v-if="confirmDelete != screener.id"
                    href="#"
                    class="text-danger"
                    @click.prevent="confirmDelete = screener.id"
                >
                    delete
                </a>
                <a
                    v-else
                    class="text-danger"
                    href="#"
                    @click.prevent="removeScreener(screener.id, $event)"
                >
                    confirm
                </a>
            </li>
        </ol>

        <div v-else class="text-white-50 m-4">
            None...
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { User } from '@interfaces/user';

export default defineComponent({
    name: 'ScreenersInfo',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        screeners: {
            type: Array as PropType<User[]>,
            required: true,
        },
    },
    data () {
        return {
            screenerInput: null,
            confirmDelete: null,
        };
    },
    watch: {
        contestId(): void {
            this.screenerInput = null;
            this.screenerInput = null;
        },
    },
    methods: {
        async addScreener(e): Promise<void> {
            const screener = await this.$http.executePost(`/contests/listing/${this.contestId}/screeners/add`, { screenerInput: this.screenerInput }, e);

            if (!this.$http.isError(screener)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Added ${this.screenerInput} to list (${this.screeners.length + 1})`,
                    type: 'info',
                });
                this.$store.commit('addScreener', {
                    contestId: this.contestId,
                    screener,
                });
            }
        },
        async removeScreener(screenerId, e): Promise<void> {
            const res = await this.$http.executePost(`/contests/listing/${this.contestId}/screeners/remove`, { screenerId }, e);

            if (!this.$http.isError(res)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Removed user from list`,
                    type: 'info',
                });
                this.$store.commit('deleteScreener', {
                    contestId: this.contestId,
                    screenerId,
                });
            }
        },
    },
});
</script>