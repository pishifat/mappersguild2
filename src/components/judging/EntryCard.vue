<template>
    <div class="col-sm-12 my-1">
        <div class="card static-card" :class="userVote == 1 ? 'fifth-favorite' : userVote == 2 ? 'fourth-favorite' : userVote == 3 ? 'third-favorite' : userVote == 4 ? 'second-favorite' : userVote == 5 ? 'first-favorite' : 'bg-dark'">
            <div class="card-body text-shadow min-spacing">
                <div class="min-spacing mt-1 row">
                    <div class="col-sm-2 d-flex align-items-center">
                        {{ entry.name }}
                    </div>
                    <div class="col-sm-2">
                        <select v-model="tempVote" class="form-control form-control-sm mx-2" @change="updateVote()">
                            <option value="0">
                                no value
                            </option>
                            <option v-if="!fifthOccupied || userVote == 1" value="1">
                                5th
                            </option>
                            <option v-if="!fourthOccupied || userVote == 2" value="2">
                                4th
                            </option>
                            <option v-if="!thirdOccupied || userVote == 3" value="3">
                                3rd
                            </option>
                            <option v-if="!secondOccupied || userVote == 4" value="4">
                                2nd
                            </option>
                            <option v-if="!firstOccupied || userVote == 5" value="5">
                                1st
                            </option>
                        </select>
                    </div>
                    <div v-if="isAdmin" class="col-sm-6 d-flex align-items-center small text-white-50">
                        {{ findVoteInfo() }}
                    </div>
                </div>
                <!--notes-->
                <div class="min-spacing mb-1 ml-2">
                    <a href="#" @click.prevent="updateComment()">
                        <i class="fas fa-edit" />
                    </a>
                    <span v-if="!showCommentInput" class="small text-shadow min-spacing text-white-50">{{ tempComment || '...' }}</span>
                    <input
                        v-if="showCommentInput"
                        v-model="tempComment"
                        class="custom-input small w-75"
                        rows="4"
                        type="text"
                        placeholder="enter to submit..."
                        style="border-radius: 5px 5px 5px 5px;"
                        maxlength="1000"
                        @keyup.enter="updateComment($event)"
                        @change="updateComment($event)"
                    >
                </div>
                <div v-if="isAdmin">
                    <ul style="list-style-type: disc">
                        <li v-for="evaluation in entry.evaluations" :key="evaluation.id" class="small text-white-50">
                            {{ evaluation.screener.username }} ({{ evaluation.vote }})<br>
                            {{ evaluation.comment }}
                        </li>
                    </ul>
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
    name: 'EntryCard',
    props: {
        entry: {
            type: Object,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        firstOccupied: Boolean,
        secondOccupied: Boolean,
        thirdOccupied: Boolean,
        fourthOccupied: Boolean,
        fifthOccupied: Boolean,
        isAdmin: Boolean,
    },
    data () {
        return {
            showCommentInput: false,
            userComment: null,
            tempComment: null,
            userVote: 0,
            tempVote: 0,
            info: null,
        };
    },
    mounted () {
        for (let i = 0; i < this.entry.evaluations.length; i++) {
            const evaluation = this.entry.evaluations[i];

            if (evaluation.screener.id == this.userId) {
                this.userComment = evaluation.comment;
                this.tempComment = evaluation.comment;
                this.userVote = evaluation.vote || 0;
                this.tempVote = evaluation.vote || 0;
                break;
            }
        }
    },
    methods: {
        async updateComment (e) {
            if (!e) {
                this.showCommentInput = !this.showCommentInput;
            }

            if (this.userComment != this.tempComment) {
                this.showCommentInput = !this.showCommentInput;
                const entry = await this.executePost('/screening/updateComment/' + this.entry.id, { comment: this.tempComment.trim() }, e);

                if (entry) {
                    this.userComment = this.tempComment;
                    this.$emit('update-entry', entry);
                }
            }
        },
        async updateVote () {
            if (this.userVote != this.tempVote) {
                const entry = await this.executePost('/screening/updateVote/' + this.entry.id, { vote: this.tempVote });

                if (entry) {
                    this.userVote = this.tempVote;
                    this.$emit('update-entry', entry);
                }
            }
        },
        findVoteInfo () {
            let first = 0;
            let second = 0;
            let third = 0;
            let fourth = 0;
            let fifth = 0;
            let total = 0;
            this.entry.evaluations.forEach(evaluation => {
                if (evaluation.vote == 1) fifth++;
                else if (evaluation.vote == 2) fourth++;
                else if (evaluation.vote == 3) third++;
                else if (evaluation.vote == 4) second++;
                else if (evaluation.vote == 5) first++;
                total += evaluation.vote;
            });

            return `total: ${total} / first: ${first} / second: ${second} / third: ${third} / fourth: ${fourth} / fifth: ${fifth}`;
        },
    },
};
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

.fifth-favorite {
    background-color: rgba(37, 119, 62, 0.1)!important;
}

.fourth-favorite {
    background-color: rgba(53, 111, 138, 0.1)!important;
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
