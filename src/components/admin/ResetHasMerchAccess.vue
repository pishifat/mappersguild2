<template>
    <div class="container card card-body py-1">
        <h5 class="mt-2">
            Reset hasMerchAccess
        </h5>
        <input
            v-model="osuIdInput"
            class="form-control form-control-sm mb-2"
            autocomplete="off"
            placeholder="osuIds comma separated..."
        />
        <button class="btn btn-sm w-100 btn-outline-info mb-3" @click="resetHasMerchAccess($event)">
            Reset for all users, excluding the osuIds above
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ResetHasMerchAccess',
    data() {
        return {
            osuIdInput: '',
        };
    },
    methods: {
        async resetHasMerchAccess(e): Promise<void> {
            const res: any = await this.$http.executePost('/admin/users/resetHasMerchAccess', { osuIdInput: this.osuIdInput }, e);

            if (res && !res.error) {
                this.$store.dispatch('updateToastMessages', {
                    message: `reset successfully`,
                    type: 'success',
                });
            }
        },
    },
});
</script>
