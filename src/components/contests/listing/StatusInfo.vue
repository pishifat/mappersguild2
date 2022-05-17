<template>
    <div>
        Status:

        <select
            v-model="newStatus"
            class="form-select form-select w-50 d-inline"
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
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'StatusInfo',
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
        };
    },
    watch: {
        contestId(): void {
            this.newStatus = this.status;
        },
    },
    methods: {
        async updateStatus(e): Promise<void> {
            const status = await this.$http.executePost(`/contests/listing/${this.contestId}/updateStatus`, { status: this.newStatus }, e);

            if (!this.$http.isError(status)) {
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

<style scoped>

.date-input {
    width: 10%;
}

</style>