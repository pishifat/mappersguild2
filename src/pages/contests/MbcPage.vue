<template>
    <div class="container card card-body py-1">
        <div class="p-3">
            <!--<count-notes-per-column />-->
            <six />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
// import CountNotesPerColumn from '@components/contests/mbc/CountNotesPerColumn.vue';
import Six from '@components/contests/mbc/Six.vue';

export default defineComponent({
    name: 'MbcPage',
    components: {
        //CountNotesPerColumn,
        Six,
    },
});
</script>
