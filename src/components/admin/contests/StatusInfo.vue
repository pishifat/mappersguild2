<template>
    <div>
        <p class="text-white-50">
            <span v-if="!showStatusInput" class="text-capitalize">
                status: {{ status }}
            </span>

            <select
                v-else
                v-model="newStatus"
                class="form-control form-control-sm w-25 mx-auto"
                @change="updateStatus($event)"
            >
                <option value="beatmapping">
                    Beatmapping
                </option>
                <option value="screening">
                    Screening
                </option>
                <option value="judging">
                    Judging
                </option>
                <option value="complete">
                    Complete
                </option>
            </select>

            <a href="#" @click.prevent="showStatusInput = !showStatusInput">
                <i class="fas fa-edit" />
            </a>
        </p>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'DateInfo',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            default: null,
        },
    },
    data () {
        return {
            newStatus: this.status,
            showStatusInput: false,
        };
    },
    methods: {
        async updateStatus(e): Promise<void> {
            const status = await this.executePost(`/admin/contests/${this.contestId}/updateStatus`, { status: this.newStatus }, e);

            if (!this.isError(status)) {
                this.showStatusInput = false;
                this.$store.dispatch('updateToastMessages', {
                    message: `updated contest status`,
                    type: 'info',
                });
                this.$store.commit('updateStatus', {
                    contestId: this.contestId,
                    status,
                });
            }
        },
    },
});
</script>

<style>

.date-input {
    width: 10%;
}

</style>