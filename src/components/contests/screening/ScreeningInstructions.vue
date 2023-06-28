<template>
    <div class="mb-2">
        <ul>
            <li>Mark your personal <b>top 5</b> submissions with stars. If the contest has a theme/additional rules, consider those when making your choices.</li>
            <li>
                Stars
                <i
                    class="fa-star fas text-warning"
                />
                indicate the order of your top 5. The star on the <b>left is the lowest score</b>, while the star on the <b>right is the highest score</b>.
            </li>
            <li>Comments will be seen by the map creator. Your name will be anonymous.</li>
            <li>DO NOT discuss your choices with other screeners or outsiders until after the contest is concluded.</li>
            <li>The overall highest scoring submissions will be included in the judging phase!</li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ScreeningInstructions',
});
</script>