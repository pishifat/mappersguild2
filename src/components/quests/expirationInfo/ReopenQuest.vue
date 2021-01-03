<template>
    <div class="row">
        <div class="col-sm-12">
            <button
                class="btn btn-sm w-100 btn-outline-success mb-2"
                :disabled="!enoughPoints"
                @click.prevent="reopenQuest($event)"
            >
                Re-open quest for {{ price }} points <i class="fas fa-coins fa-xs" />
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { PointsRefreshResponse } from '@interfaces/api/quests';

export default defineComponent({
    name: 'ReopenQuest',
    props: {
        questId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        enoughPoints(): boolean {
            return (this.loggedInUser.availablePoints - this.price) > 0;
        },
    },
    methods: {
        async reopenQuest(e): Promise<void> {
            if (confirm(`Are you sure?\n\nYou are about to spend ${ this.price } Mappers' Guild points to re-open this quest.\n\nYou have ${ this.loggedInUser.availablePoints } points available.`)) {
                const res = await this.$http.executePost<PointsRefreshResponse>(`/quests/${this.questId}/reopen`, { status: this.status }, e);

                if (!this.$http.isError(res)) {
                    this.$store.dispatch('quests/setQuests', res.quests);
                    this.$store.commit('setAvailablePoints', res.availablePoints);
                    this.$bs.hideModal('editQuest');
                }
            }
        },
    },
});
</script>
