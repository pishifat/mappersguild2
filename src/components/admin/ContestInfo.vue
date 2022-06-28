<template>
    <modal-dialog id="editContest" :loaded="Boolean(contest)">
        <template #header>
            {{ contest.name }}
        </template>

        <template #default>
            <div class="container">
                <p>
                    <button
                        class="btn btn-sm btn-outline-info w-100"
                        @click="toggleIsApproved($event)"
                    >
                        {{ contest.isApproved ? 'Disable' : 'Enable' }} public
                        visibility
                    </button>
                </p>
            </div>
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import ModalDialog from '@components/ModalDialog.vue';
import { defineComponent } from 'vue';
import { Contest } from '../../../interfaces/contest/contest';

export default defineComponent({
    name: 'ContestInfo',
    components: {
        ModalDialog,
    },
    props: {
        contest: {
            type: Object as () => Contest,
            default: null,
        },
    },
    methods: {
        async toggleIsApproved(e): Promise<void> {
            const res: any = await this.$http.executePost(
                `/admin/contests/${this.contest.id}/toggleIsApproved`,
                { isApproved: !this.contest.isApproved },
                e
            );

            if (res) {
                this.$store.dispatch('updateToastMessages', {
                    message: `set isApproved to ${res.isApproved}`,
                    type: 'info',
                });
                this.$store.commit('updateIsApproved', {
                    contestId: this.contest.id,
                    isApproved: res.isApproved,
                });
            }
        },
    },
});
</script>