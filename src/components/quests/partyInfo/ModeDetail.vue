<template>
    <div class="ms-3 mt-1">
        <b class="me-1">Modes:</b>
        <modes-icons
            :modes="party.modes"
            :toggler="party.leader.id == $store.state.loggedInUser?.id"
            @toggle="togglePartyMode($event)"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModesIcons from '@components/ModesIcons.vue';
import { Party } from '@interfaces/party';

export default defineComponent({
    components: { ModesIcons },
    props: {
        party: {
            type: Object as () => Party,
            required: true,
        },
        questId: {
            type: String,
            required: true,
        },
    },
    methods: {
        async togglePartyMode(mode: string): Promise<void> {
            const party = await this.$http.executePost(`/parties/${this.party.id}/toggleMode`, { mode });

            if (!this.$http.isError(party)) {
                this.$store.dispatch('quests/updateParty', party);
            }
        },
    },
});
</script>
