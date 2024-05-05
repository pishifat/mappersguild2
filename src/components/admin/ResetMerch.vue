<template>
    <div class="container card card-body py-1">
        <h5 class="mt-2">
            Reset Merch
        </h5>
        <div class="mb-2">
            <div class="row">
                <div class="col-sm-6">
                    <select v-model="field" class="form-select form-select-sm mb-2">
                        <option
                            disabled
                            value=""
                        >
                            Select a field
                        </option>
                        <option value="HasMerchAccess">
                            hasMerchAccess
                        </option>
                        <option value="HasSpecificMerchOrder">
                            hasSpecificMerchOrder
                        </option>
                        <option value="WorldCupMerch">
                            worldCupMerch
                        </option>
                    </select>
                </div>
                <div class="col-sm-6">
                    <input
                        v-model="osuIdInput"
                        class="form-control form-control-sm mb-2"
                        autocomplete="off"
                        placeholder="exclude osuIds (comma separated) from reset..."
                    />
                </div>
            </div>
            <button :disabled="!field.length" class="btn btn-sm btn-outline-info w-25 me-2" @click="loadUsers($event)">
                Load users
            </button>
            <button :disabled="!field.length" class="btn btn-sm btn-outline-danger w-25" @click="reset($event)">
                Reset
            </button>
            <copy-paste v-if="users.length" class="col-sm-6">
                <div v-for="user in users" :key="user.id">
                    {{ user.username }}
                </div>
            </copy-paste>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CopyPaste from '@components/CopyPaste.vue';

export default defineComponent({
    name: 'ResetHasMerchAccess',
    components: {
        CopyPaste,
    },
    data() {
        return {
            osuIdInput: '',
            field: '',
            users: [],
        };
    },
    methods: {
        async reset(e): Promise<void> {
            const result = confirm('Are you sure?');

            if (result) {
                const res: any = await this.$http.executePost(`/admin/users/resetMerchUsers`, { osuIdInput: this.osuIdInput, field: this.field }, e);

                if (res && !res.error) {
                    this.$store.dispatch('updateToastMessages', {
                        message: `reset ${res} users`,
                        type: 'success',
                    });
                }

                this.users = [];
            }
        },
        async loadUsers(e): Promise<void> {
            const users: any = await this.$http.executePost(`/admin/users/loadMerchUsers`, { field: this.field }, e);

            if (users && !users.error) {
                this.users = users;
                this.$store.dispatch('updateToastMessages', {
                    message: `loaded ${users.length} users`,
                    type: 'success',
                });
            }
        },
    },
});
</script>
