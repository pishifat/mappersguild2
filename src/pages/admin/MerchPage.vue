<template>
    <div>
        <load-users />
        <hr />
        <find-merch-by-osu-id />
        <reset-merch />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ResetMerch from '@components/admin/ResetMerch.vue';
import LoadUsers from '@components/admin/LoadUsers.vue';
import FindMerchByOsuId from '@components/admin/FindMerchByOsuId.vue';

export default defineComponent({
    components: {
        LoadUsers,
        ResetMerch,
        FindMerchByOsuId,
    },
});
</script>
