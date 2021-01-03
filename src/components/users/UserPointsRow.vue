<template>
    <tr class="text-white-50">
        <td
            scope="row"
            data-bs-toggle="tooltip"
            data-bs-placement="left"
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
import { defineComponent } from 'vue';

export default defineComponent({
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
