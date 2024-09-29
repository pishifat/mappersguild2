<template>
    <div>
        <load-users />
        <hr />
        <osu-api-user-search />
        <add-user-manually />
        <hr />
        <showcase-user-list />
        <contest-helper-user-list />
        <discord-highlight-generator />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LoadUsers from '../../components/admin/LoadUsers.vue';
import ShowcaseUserList from '../../components/admin/ShowcaseUserList.vue';
import ContestHelperUserList from '../../components/admin/ContestHelperUserList.vue';
import DiscordHighlightGenerator from '../../components/admin/DiscordHighlightGenerator.vue';
import OsuApiUserSearch from '../../components/admin/OsuApiUserSearch.vue';
import AddUserManually from '@components/mentorship/AddUserManually.vue';

export default defineComponent({
    components: {
        LoadUsers,
        ShowcaseUserList,
        ContestHelperUserList,
        DiscordHighlightGenerator,
        OsuApiUserSearch,
        AddUserManually,
    },
});
</script>
