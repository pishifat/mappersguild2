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
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="name..."
                            v-model="name"
                        />
                    </p>
                    <p>
                        <input
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="reward..."
                            v-model="reward"
                        />
                    </p>
                    <p>
                        <input
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="description..."
                            v-model="description"
                        />
                    </p>
                    <p>
                        <input
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="timeframe..."
                            v-model="timeframe"
                        />
                    </p>
                    <p>
                        <input
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="minimum party..."
                            v-model="minParty"
                        />
                    </p>
                    <p>
                        <input
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="maximum party..."
                            v-model="maxParty"
                        />
                    </p>
                    <p>
                        <input
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="minimum rank..."
                            v-model="minRank"
                        />
                    </p>
                    <p>
                        <input
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="artist osu ID..."
                            v-model="osuId"
                        />
                    </p>
                    <p>
                        <input
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="color..."
                            v-model="color"
                        />
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

<script>
export default {
    name: 'add-quest',
    methods: {
        executePost: async function(path, data, e) {
            if (e) e.target.disabled = true;

            try {
                const res = await axios.post(path, data);

                if (res.data.error) {
                    this.info = res.data.error;
                } else {
                    if (e) e.target.disabled = false;
                    return res.data;
                }
            } catch (error) {
                console.log(error);
            }

            if (e) e.target.disabled = false;
        },
        addQuest: async function(e) {
            const q = await this.executePost('/admin/addQuest/', {
                name: this.name, 
                reward: this.reward, 
                descriptionMain: this.description, 
                timeframe: this.timeframe, 
                minParty: this.minParty, 
                maxParty: this.maxParty, 
                minRank: this.minRank, 
                art: this.osuId, 
                color: this.color,
                }, e);
            if (q) {
                this.$emit('add-quest', q);
                $('#addQuest').modal('hide');
            }
        },
    },
    data() {
        return {
            name: null,
            reward: null,
            description: null,
            timeframe: null,
            minParty: null,
            maxParty: null,
            minRank: null,
            osuId: null,
            color: null,
        };
    },
};
</script>