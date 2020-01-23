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
                    <p>
                        <input
                            class="form-control-sm w-100"
                            type="text"
                            autocomplete="off"
                            placeholder="name..."
                            v-model="elementName"
                        />
                    </p>
                    <p>
                    <button class="btn btn-sm btn-outline-info" @click="createElement($event)">
                        Add {{ type }}
                    </button>
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
    },
    methods: {
        executePost: async function (path, data, e) {
			if (e) e.target.disabled = true;

			try {
				const res = await axios.post(path, data)

				if (res.data.error) {
					this.$parent.info = res.data.error;
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
                element = await this.executePost(`/judging/createEntry`, { entryName: this.elementName, contest: this.contest }, e);
            }else if(this.type == 'contest'){
                element = await this.executePost(`/judging/createContest`, { name: this.elementName }, e);
            }
            if (element && this.type == 'entry') {
                this.$parent.entries.unshift(element);
            }
            $('#addElement').modal('hide');
		},
    },
    data() {
        return {
            elementName: '',
            contest: null,
        };
    },
}
</script>

<style>

</style>
