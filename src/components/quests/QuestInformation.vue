<template>
    <div class="container card card-body py-3 mb-2">
        <a href="#questInformation" data-bs-toggle="collapse" @click.prevent>
            How do quests work?
            <i class="fas fa-angle-down" />
        </a>
        <div id="questInformation" class="collapse ms-4">
            <div class="small text-secondary">
                Here's a breakdown of this example quest:
            </div>
            <example-quest
                :quest="exampleQuest"
            />
        </div>
        <a href="#questRewards" data-bs-toggle="collapse" @click.prevent>
            What are the rewards for completing a quest?
            <i class="fas fa-angle-down" />
        </a>
        <div id="questRewards" class="collapse ms-4 small">
            <div><b>Quest Instructions</b></div>
            <div class="ms-4">bnlablabla</div>

            <div><b>Quest rewards</b></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import ExampleQuest from '@components/quests/ExampleQuest.vue';

export default defineComponent({
    name: 'QuestInformation',
    components: {
        ExampleQuest,
    },
    computed: {
        ...mapState('quests', [
            'exampleQuest',
        ]),
    },
});
</script>
