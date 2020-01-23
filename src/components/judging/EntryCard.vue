<template>
<div class="col-sm-12 my-1">
    <div class="card static-card" :class="artist.isPriority ? 'card-bg-priority' : 'bg-dark'">
        <div class="card-body text-shadow min-spacing">
            <div class="min-spacing mt-1 row">
                <span class="col-sm-12">
                    {{entry.entryName}}
                </span>
            </div>
            <!--notes-->
            <div class="min-spacing mb-1 ml-2">
                <a href="#" @click.prevent="updateComment()">
                    <i class="fas fa-edit"></i>
                </a>
                <span v-if="!showCommentInput" class="small text-shadow min-spacing text-white-50">words words words</span>
                <input
                    v-if="showCommentInput"
                    class="custom-input small w-75"
                    rows="4"
                    type="text"
                    placeholder="enter to submit..."
                    style="border-radius: 5px 5px 5px 5px;"
                    v-model="tempComment"
                    @keyup.enter="updateComment($event)"
                    @change="updateComment($event)"
                >
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: 'entry-card',
    props: {
        entry: Object,
        userId: String,
    },
    watch: {
        entry: function(){
            //find the relevant comment/vote for user
        }
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
    },
    data() {
        return {
            showCommentInput: false,
            tempComment: '',
        }
    },
    created () {
        this.tempComment = this.entry.comment;
    }
}
</script>

<style>
.font-8{
    font-size: 8pt;
}

input,
input:focus {
    background-color: #333;
    color: white;
    border-color: transparent;
    filter: drop-shadow(1px 1px 1px #000000);
    border-radius: 0 100px 100px 0;
}

.collapsing {
    -webkit-transition: none;
    transition: none;
    display: none;
}
</style>
