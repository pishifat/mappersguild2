<template>
    <div>
        <div :id="type + 'Add'" class="modal fade" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content bg-dark">
                    <div class="modal-header text-dark bg-rest">
                        <h5 class="modal-title">
                            Add {{ type }}
                        </h5>
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body" style="overflow: hidden">
                        <p v-if="contests" class="form-row">
                            <select v-model="selectedContest" class="form-control form-control-sm w-100 mx-2">
                                <option v-for="contest in contests" :key="contest.id" :value="contest.id">
                                    {{ contest.name }}
                                </option>
                            </select>
                        </p>
                        <p v-if="contests" class="form-row">
                            <input
                                v-model="osuId"
                                class="form-control-sm w-100"
                                type="text"
                                autocomplete="off"
                                placeholder="creator/screener's osuId..."
                            >
                        </p>
                        <p v-if="type != 'screener'" class="form-row">
                            <input
                                v-model="elementName"
                                class="form-control-sm w-100"
                                type="text"
                                autocomplete="off"
                                placeholder="name..."
                            >
                        </p>
                        <p>
                            <button class="btn btn-sm btn-outline-info" @click="type == 'screener' ? addScreener($event) : createElement($event)">
                                Add {{ type }}
                            </button>
                        </p>
                        <p v-if="info" class="errors">
                            {{ info }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AddElement',
    props: {
        type: {
            type: String,
            required: true,
        },
        contests: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            elementName: '',
            osuId: '',
            selectedContest: null,
            info: null,
        };
    },
    methods: {
        async createElement (e) {
            let element;

            if (this.type == 'entry') {
                element = await this.executePost(`/screening/createEntry`, { name: this.elementName, contest: this.selectedContest, osuId: this.osuId }, e);
            } else if (this.type == 'contest') {
                element = await this.executePost(`/screening/createContest`, { name: this.elementName }, e);
            }

            if (element) {
                if (this.type == 'entry') {
                    this.$parent.entries.unshift(element);
                } else if (this.type == 'contest') {
                    this.$parent.contests.unshift(element);
                }

                $('#addElement').modal('hide');
                this.info = '';
            }
        },
        async addScreener (e) {
            const contest = await this.executePost(`/screening/addScreener/${this.selectedContest}`, { osuId: this.osuId }, e);

            if (contest) {
                this.info = `added ${this.osuId} (${contest.screeners.length})`;
            }
        },
    },
};
</script>
