<template>
    <div>
        <img
            class="w-100"
            :src="bannerUrl"
        />
        <hr />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ContestBanner',
    props: {
        bannerUrl: {
            type: String,
            required: true,
        },
    },
});
</script>