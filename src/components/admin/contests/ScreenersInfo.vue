<template>
    <div>
        <p>
            Screeners:
            <input
                v-model.number="screenerOsuId"
                class="form-control-sm"
                type="number"
                autocomplete="off"
                placeholder="new screener's osuId..."
                @keyup.enter="addScreener($event)"
            >
        </p>

        <ul v-if="screeners.length">
            <li
                v-for="screener in screeners"
                :key="screener.id"
            >
                {{ screener.username }}

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
                    @click.prevent="removeScreener(screener.id)"
                >
                    confirm
                </a>
            </li>
        </ul>

        <div v-else>
            None...
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'ScreenersInfo',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        screeners: {
            type: Array,
            required: true,
        },
    },
    data () {
        return {
            screenerOsuId: null,
            confirmDelete: null,
        };
    },
    methods: {
        async addScreener(e): Promise<void> {
            const screener = await this.executePost(`/admin/contests/${this.contestId}/screeners/add`, { osuId: this.screenerOsuId }, e);

            if (!this.isError(screener)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `added ${this.screenerOsuId} (${this.screeners.length + 1})`,
                    type: 'info',
                });
                this.$store.commit('addScreener', {
                    contestId: this.contestId,
                    screener,
                });
            }
        },
        async removeScreener(screenerId, e): Promise<void> {
            const res = await this.executePost(`/admin/contests/${this.contestId}/screeners/remove`, { screenerId }, e);

            if (!this.isError(res)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `deleted`,
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