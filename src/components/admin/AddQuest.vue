<template>
    <div id="addQuest" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content bg-dark">
                <div class="modal-header text-dark bg-rest">
                    <h5 class="modal-title">
                        Add quest
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden">
                    <p>
                        <input
                            v-model="name"
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="name..."
                        >
                    </p>
                    <p>
                        <input
                            v-model="reward"
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="reward..."
                        >
                    </p>
                    <p>
                        <textarea
                            v-model="description"
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="description..."
                        />
                    </p>
                    <p>
                        <input
                            v-model="timeframe"
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="timeframe (days)..."
                        >
                    </p>
                    <p>
                        <input
                            v-model="minParty"
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="minimum party..."
                        >
                    </p>
                    <p>
                        <input
                            v-model="maxParty"
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="maximum party..."
                        >
                    </p>
                    <p>
                        <input
                            v-model="minRank"
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="minimum rank..."
                        >
                    </p>
                    <p>
                        <input
                            v-model="osuId"
                            class="form-control-sm w-100"
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
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'AddQuest',
    data() {
        return {
            name: null,
            reward: null,
            description: null,
            timeframe: 0,
            minParty: null,
            maxParty: null,
            minRank: null,
            osuId: null,
            color: null,
        };
    },
    methods: {
        async addQuest(e): Promise<void> {
            const q = await this.executePost('/admin/addQuest/', {
                name: this.name,
                reward: this.reward,
                descriptionMain: this.description,
                timeframe: this.timeframe * (24*3600*1000),
                minParty: this.minParty,
                maxParty: this.maxParty,
                minRank: this.minRank,
                art: this.osuId,
                color: this.color,
            }, e);

            if (!this.isError(q)) {
                this.$emit('add-quest', q);
                ($('#addQuest') as any).modal('hide');
            }
        },
    },
});
</script>