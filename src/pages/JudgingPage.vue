<template>
<div>
    <div class="container bg-container py-1">
		<div class="row">
			<div class="col">
                <h5 class="my-2">
                    Monthly Beatmapping Contest #1
                    <span v-if="isAdmin">
                        <button class="btn btn-sm btn-outline-info" data-toggle="modal" data-target="#contestAdd">Add contest</button>
                        <button class="btn btn-sm btn-outline-info" data-toggle="modal" data-target="#entryAdd">Add entry</button>
                        <button class="btn btn-sm btn-outline-info" data-toggle="modal" data-target="#judgeAdd">Add judge</button>
                    </span>
                </h5>
                <transition-group v-if="entries && entries.length" name="list" tag="div" class="row">
                    <entry-card
                        v-for="entry in entries"
                        :key="entry.id"
                        :entry="entry"
                        :user-id="userId"
                        :first-occupied.sync="firstOccupied"
                        :second-occupied.sync="secondOccupied"
                        :third-occupied.sync="thirdOccupied"
                        :is-admin="isAdmin"
                        @update-entry="updateEntry($event)"
                    ></entry-card>
                </transition-group>
                <p v-else class="ml-4">
                    No entries...
                </p>
			</div>
		</div>
	</div>

    <add-element
        :type="'entry'"
        :contests="contests"
    />
    <add-element
        :type="'judge'"
        :contests="contests"
    />
    <add-element
        :type="'contest'"
    />
</div>
</template>

<script>
import AddElement from '../components/judging/AddElement.vue';
import EntryCard from '../components/judging/EntryCard.vue';

export default {
    name: 'judging-page',
    components: {
        AddElement,
        EntryCard
    },
    data() {
        return {
            entries: null,
            contests: null,
            userId: null,
            isAdmin: null,
            firstOccupied: false,
            secondOccupied: false,
            thirdOccupied: false,
        };
    },
    watch: {
        entries() {
            this.findOccupiedVotes();
        }
    },
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
                this.info = 'Something went wrong';
            }
            if (e) e.target.disabled = false;
        },
        findOccupiedVotes() {
            this.thirdOccupied = this.secondOccupied = this.firstOccupied = false;
            this.entries.forEach(entry => {
                for (let i = 0; i < entry.evaluations.length; i++) {
                    const evaluation = entry.evaluations[i];
                    if(evaluation.judge.id == this.userId){
                        if(evaluation.vote == 1) this.thirdOccupied = true;
                        else if(evaluation.vote == 2) this.secondOccupied = true;
                        else if(evaluation.vote == 3) this.firstOccupied = true;
                        break;
                    }
                }
            })
        },
        updateEntry: function (entry) {
			let i = this.entries.findIndex(e => e.id == entry.id);
            this.entries[i] = entry;
            this.findOccupiedVotes();
		},
    },
    created() {
        axios
            .get('/judging/relevantInfo')
            .then(response => {
                this.entries = response.data.entries;
                this.contests = response.data.contests;
                this.userId = response.data.userId;
                this.isAdmin = response.data.isAdmin;
            })
            .then(function() {
                $('#loading').fadeOut();
                $('#app')
                    .attr('style', 'visibility: visible')
                    .hide()
                    .fadeIn();
            });
    },
    mounted() {
        
    },
};
</script>

<style>

</style>
