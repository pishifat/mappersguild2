<template>
    <tr class="text-white-50">
        <td
            scope="row"
            data-toggle="tooltip"
            data-placement="left"
            :title="tooltipTitle"
        >
            {{ display }}
        </td>
        <td scope="row">
            {{ Math.round(points * 10) / 10 }}
        </td>
    </tr>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'UserPointsRow',
    props: {
        points: {
            type: Number,
            required: true,
        },
        display: {
            type: String,
            required: true,
        },
        tooltipTitle: {
            type: String,
            required: true,
        },
    },
});
</script>
