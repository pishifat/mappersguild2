<template>
<div>
    <div class="container bg-container py-1">
		<div class="row">
			<div class="col">
				<button class="btn btn-sm btn-outline-info" data-toggle="modal" data-target="#contestAdd">Add contest</button>
                <button class="btn btn-sm btn-outline-info" data-toggle="modal" data-target="#entryAdd">Add entry</button>
                <transition-group name="list" tag="div" class="row">
                    <entry-card
                        v-for="entry in entries"
                        :key="entry.id"
                        :entry="entry"
                        :user-id="userId"
                        @update-entry="updateEntry($event)"
                    ></entry-card>
                </transition-group>
			</div>
		</div>
	</div>

    <add-element
        :type="'entry'"
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
    watch: {
        
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
    },
    data() {
        return {
            entries: null,
            userId: null,
        };
    },
    created() {
        axios
            .get('/judging/relevantInfo')
            .then(response => {
                this.entries = response.data.entries;
                this.userId = response.data.userId;
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
