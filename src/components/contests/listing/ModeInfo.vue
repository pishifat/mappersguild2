<template>
    <div>
        Mode:

        <select
            v-model="newMode"
            class="form-select form-select w-50 d-inline"
            @change="updateMode($event)"
        >
            <option value="" selected disabled>
                Select a mode
            </option>
            <option value="osu">
                osu!
            </option>
            <option value="taiko">
                osu!taiko
            </option>
            <option value="catch">
                osu!catch
            </option>
            <option value="mania">
                osu!mania
            </option>
        </select>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ModeInfo',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        mode: {
            type: String,
            default: '',
        },
    },
    data () {
        return {
            newMode: this.mode,
        };
    },
    watch: {
        contestId(): void {
            this.newMode = this.mode;
        },
    },
    methods: {
        async updateMode(e): Promise<void> {
            const mode = await this.$http.executePost(`/contests/listing/${this.contestId}/updateMode`, { mode: this.newMode }, e);

            if (!this.$http.isError(mode)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated contest mode`,
                    type: 'info',
                });
                this.$store.commit('updateMode', {
                    contestId: this.contestId,
                    mode,
                });
            } else {
                this.newMode = this.mode;
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