<template>
    <div class="container text-center mb-2">
        <div class="card">
            <div class="card-header">
                Something went wrong!
            </div>
            <div class="card-body">
                Contact <a href="https://osu.ppy.sh/community/chat?channel_id=3178418" target="_blank">pishifat</a> if you continue having problems. If the osu! website is down, please wait!
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Error',
});
</script>
