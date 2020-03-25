<template>
    <div class="row">
        <div class="col-sm-12">
            <button
                class="btn btn-sm btn-block btn-outline-success mb-2"
                :disabled="!enoughPoints"
                @click.prevent="reopenQuest($event)"
            >
                Re-open quest for {{ price }} points <i class="fas fa-coins small" />
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

export default Vue.extend({
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
            'availablePoints',
        ]),
        enoughPoints(): boolean {
            return (this.availablePoints - this.price) > 0;
        },
    },
    methods: {
        async reopenQuest(e): Promise<void> {
            if (confirm(`Are you sure?\n\nYou are about to spend ${ this.price } Mappers' Guild points to re-open this quest.\n\nYou have ${ this.availablePoints } points available.`)) {
                const res: any = await this.executePost('/quests/reopenQuest/' + this.questId, { status: this.status }, e);

                if (!this.isError(res)) {
                    this.$store.commit('setQuests', res.quests);
                    this.$store.commit('setAvailablePoints', res.availablePoints);
                }
            }
        },
    },
});
</script>