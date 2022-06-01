<template>
    <div class="form-inline w-100 mt-2">
        Name:
        <input
            v-model="newName"
            class="ml-1 form-control d-inline w-75"
            @change="updateName($event)"
        >
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'TitleEdit',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            default: null,
        },
    },
    data () {
        return {
            newName: this.name,
        };
    },
    watch: {
        contestId(): void {
            this.newName = this.name;
        },
    },
    methods: {
        async updateName(e): Promise<void> {
            const name = await this.$http.executePost(`/contests/listing/${this.contestId}/updateName`, { name: this.newName }, e);

            if (!this.$http.isError(name)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated contest name`,
                    type: 'info',
                });
                this.$store.commit('updateName', {
                    contestId: this.contestId,
                    name,
                });
            }
        },
    },
});
</script>