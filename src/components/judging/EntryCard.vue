<template>
<div class="col-sm-12 my-1">
    <div class="card static-card" :class="userVote == 1 ? 'third-favorite' : userVote == 2 ? 'second-favorite' : userVote == 3 ? 'first-favorite' : 'bg-dark'">
        <div class="card-body text-shadow min-spacing">
            <div class="min-spacing mt-1 row">
                <div class="col-sm-2 d-flex align-items-center">
                    {{ entry.name }}
                </div>
                <div class="col-sm-2">
                    <select v-model="tempVote" @change="updateVote()" class="form-control form-control-sm mx-2">
                        <option value=0>no value</option>
                        <option v-if="!thirdOccupied || this.userVote == 1" value=1>3rd</option>
                        <option v-if="!secondOccupied || this.userVote == 2" value=2>2nd</option>
                        <option v-if="!firstOccupied || this.userVote == 3" value=3>1st</option>
                    </select>
                </div>
            </div>
            <!--notes-->
            <div class="min-spacing mb-1 ml-2">
                <a href="#" @click.prevent="updateComment()">
                    <i class="fas fa-edit"></i>
                </a>
                <span v-if="!showCommentInput" class="small text-shadow min-spacing text-white-50">{{ tempComment || '...' }}</span>
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
            <p v-if="info" class="errors">
                {{ info }}
            </p>
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
        firstOccupied: Boolean,
        secondOccupied: Boolean,
        thirdOccupied: Boolean,
    },
    mounted () {
        for (let i = 0; i < this.entry.evaluations.length; i++) {
            const evaluation = this.entry.evaluations[i];
            if(evaluation.judge.id == this.userId){
                this.userComment = evaluation.comment;
                this.tempComment = evaluation.comment;
                this.userVote = evaluation.vote || 0;
                this.tempVote = evaluation.vote || 0;
                break;
            }
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
        updateComment: async function (e) {
            if(!e){
                this.showCommentInput = !this.showCommentInput;
            }
            if(this.userComment != this.tempComment){
                this.showCommentInput = !this.showCommentInput;
                const entry = await this.executePost('/judging/updateComment/' + this.entry.id, {comment: this.tempComment.trim()}, e);
                if (entry) {
                    this.userComment = this.tempComment;
                    this.$emit('update-entry', entry);
                }
            }
        },
        updateVote: async function () {
            if(this.userVote != this.tempVote){
                const entry = await this.executePost('/judging/updateVote/' + this.entry.id, {vote: this.tempVote});
                if (entry) {
                    this.userVote = this.tempVote;
                    this.$emit('update-entry', entry);
                }
            }
        },
    },
    data() {
        return {
            showCommentInput: false,
            userComment: null,
            tempComment: null,
            userVote: 0,
            tempVote: 0,
            info: null,
        }
    },
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

.w-10 {
    width: 10%;
}

.third-favorite {
    background-color: rgba(138, 98, 53, 0.1)!important;
}

.second-favorite {
    background-color: rgba(217, 224, 224, 0.15) !important;
}

.first-favorite {
    background-color: rgba(255, 251, 0, 0.075)!important;
}
</style>
