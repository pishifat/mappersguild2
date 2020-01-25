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
                        <select v-model="contest" class="form-control form-control-sm w-100 mx-2">
                            <option v-for="contest in contests" :key="contest.id" :value="contest.id">{{ contest.name }}</option>
                        </select>
                    </p>
                    <p v-if="contests" class="form-row">
                        <input
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="creator/judge's osuId..."
                            v-model="osuId"
                        />
                    </p>
                    <p v-if="type != 'judge'" class="form-row">
                        <input
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="name..."
                            v-model="elementName"
                        />
                    </p>
                    <p>
                        <button class="btn btn-sm btn-outline-info" @click="type == 'judge' ? addJudge($event) : createElement($event)">
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
    name: 'add-element',
    props: {
        type: String,
        contests: Array,
    },
    methods: {
        executePost: async function (path, data, e) {
			if (e) e.target.disabled = true;

			try {
				const res = await axios.post(path, data)

				if (res.data.error) {
					this.info = res.data.error;
				} else {
					if (e) e.target.disabled = false;
					return res.data;
				}
			} catch (error) {
				console.log(error)
			}

			if (e) e.target.disabled = false;
		},
        createElement: async function (e) {
            let element;
            if(this.type == 'entry'){
                element = await this.executePost(`/judging/createEntry`, { name: this.elementName, contest: this.contest, osuId: this.osuId }, e);
            }else if(this.type == 'contest'){
                element = await this.executePost(`/judging/createContest`, { name: this.elementName }, e);
            }
            if (element) {
                if(this.type == 'entry'){
                    this.$parent.entries.unshift(element);
                }else if(this.type == 'contest'){
                    this.$parent.contests.unshift(element);
                }
                $('#addElement').modal('hide');
                this.info = '';
            }
        },
        addJudge: async function (e) {
            const contest = await this.executePost(`/judging/addJudge/${this.contest}`, { osuId: this.osuId }, e);
            if (contest) {
                this.info = `added ${this.osuId} (${contest.judges.length})`;
            }
        }
    },
    data() {
        return {
            elementName: '',
            osuId: '',
            contest: null,
            info: null,
        };
    },
}
</script>

<style>

</style>
