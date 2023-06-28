<template>
    <tr class="text-secondary">
        <td
            v-bs-tooltip:left="tooltipTitle"
            scope="row"
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
