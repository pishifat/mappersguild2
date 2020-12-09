<template>
    <modal-dialog id="addQuest" title="Add quest">
        <p>
            <input
                v-model="name"
                class="form-control form-control-sm w-100"
                type="text"
                autocomplete="off"
                placeholder="name..."
            >
        </p>
        <p>
            <input
                v-model="price"
                class="form-control form-control-sm w-100"
                type="text"
                autocomplete="off"
                placeholder="price..."
            >
        </p>
        <p>
            <textarea
                v-model="description"
                class="form-control form-control-sm w-100"
                type="text"
                autocomplete="off"
                placeholder="description..."
            />
        </p>
        <p>
            <input
                v-model="timeframe"
                class="form-control form-control-sm w-100"
                type="text"
                autocomplete="off"
                placeholder="timeframe (days)..."
            >
        </p>
        <p>
            <input
                v-model="minParty"
                class="form-control form-control-sm w-100"
                type="text"
                autocomplete="off"
                placeholder="minimum party..."
            >
        </p>
        <p>
            <input
                v-model="maxParty"
                class="form-control form-control-sm w-100"
                type="text"
                autocomplete="off"
                placeholder="maximum party..."
            >
        </p>
        <p>
            <input
                v-model="minRank"
                class="form-control form-control-sm w-100"
                type="text"
                autocomplete="off"
                placeholder="minimum rank..."
            >
        </p>
        <p>
            <input
                v-model="osuId"
                class="form-control form-control-sm w-100"
                type="text"
                autocomplete="off"
                placeholder="artist osu ID..."
            >
        </p>
        <p>
            <button class="btn btn-sm btn-outline-info" @click="addQuest($event)">
                Add quest
            </button>
        </p>
    </modal-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import ModalDialog from '@components/ModalDialog.vue';

export default Vue.extend({
    name: 'AddQuest',
    components: {
        ModalDialog,
    },
    data() {
        return {
            name: null,
            price: null,
            description: null,
            timeframe: 0,
            minParty: null,
            maxParty: null,
            minRank: null,
            osuId: null,
        };
    },
    methods: {
        async addQuest(e): Promise<void> {
            const quests = await this.executePost('/admin/quests/create', {
                name: this.name,
                price: this.price,
                descriptionMain: this.description,
                timeframe: this.timeframe * (24*3600*1000),
                minParty: this.minParty,
                maxParty: this.maxParty,
                minRank: this.minRank,
                art: this.osuId,
            }, e);

            if (!this.isError(quests)) {
                this.$store.commit('setQuests', quests);
                $('#addQuest').modal('hide');
            }
        },
    },
});
</script>