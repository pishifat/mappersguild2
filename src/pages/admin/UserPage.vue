<template>
    <div>
        <load-users />
        <hr />
        <osu-api-user-search />
        <add-user-manually />
        <hr />
        <discord-highlight-generator />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LoadUsers from '../../components/admin/LoadUsers.vue';
import DiscordHighlightGenerator from '../../components/admin/DiscordHighlightGenerator.vue';
import OsuApiUserSearch from '../../components/admin/OsuApiUserSearch.vue';
import AddUserManually from '@components/mentorship/AddUserManually.vue';

export default defineComponent({
    components: {
        LoadUsers,
        DiscordHighlightGenerator,
        OsuApiUserSearch,
        AddUserManually,
    },
});
</script>
