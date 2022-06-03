<template>
    <div>
        Status:

        <select
            v-model="newStatus"
            class="form-select form-select w-50 d-inline"
            @change="updateStatus($event)"
        >
            <option value="" disabled>
                Select a status
            </option>
            <option value="hidden">
                Hidden
            </option>
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
        <div v-if="!isApproved && status !== 'hidden'" class="small text-danger mt-2">
            Your contest has been queued for approval. Once approved, it will appear in "Active contests".
        </div>
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
        isApproved: {
            type: Boolean,
            required: true,
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
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated contest status`,
                    type: 'info',
                });
                this.$store.commit('updateStatus', {
                    contestId: this.contestId,
                    status,
                });
            } else {
                this.newStatus = this.status;
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