<template>
    <div>
        <div class="container card card-body py-1 mb-3">
            <div class="p-3">
                <priority-quest-limitation />
            </div>
        </div>
        <hr />
        <div class="container card card-body py-1">
            <div class="p-3">
                <h4 class="mb-3">
                    Previous
                </h4>
                <taiko-average-sv />
                <hr />
                <six />
                <hr />
                <count-notes-per-column />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CountNotesPerColumn from '@components/contests/mbc/CountNotesPerColumn.vue';
import Six from '@components/contests/mbc/Six.vue';
import TaikoAverageSv from '@components/contests/mbc/TaikoAverageSV.vue';
import PriorityQuestLimitation from '@components/contests/mbc/PriorityQuestLimitation.vue';

export default defineComponent({
    name: 'MbcPage',
    components: {
        CountNotesPerColumn,
        Six,
        TaikoAverageSv,
        PriorityQuestLimitation,
    },
});
</script>
