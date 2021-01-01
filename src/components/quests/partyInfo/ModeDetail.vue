<template>
    <div class="ms-3 mt-1">
        <b>Modes:</b>
        <span v-if="party.leader.id == $store.state.loggedInUser.id">
            <a href="#" @click.prevent="togglePartyMode('osu')">
                <i
                    class="fas fa-circle"
                    :class="party.modes.includes('osu') ? '' : 'text-white-50'"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="toggle osu!"
                />
            </a>
            <a href="#" @click.prevent="togglePartyMode('taiko')">
                <i
                    class="fas fa-drum"
                    :class="party.modes.includes('taiko') ? '' : 'text-white-50'"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="toggle osu!taiko"
                />
            </a>
            <a href="#" @click.prevent="togglePartyMode('catch')">
                <i
                    class="fas fa-apple-alt"
                    :class="party.modes.includes('catch') ? '' : 'text-white-50'"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="toggle osu!catch"
                />
            </a>
            <a href="#" @click.prevent="togglePartyMode('mania')">
                <i
                    class="fas fa-stream"
                    :class="party.modes.includes('mania') ? '' : 'text-white-50'"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="toggle osu!mania"
                />
            </a>
        </span>
        <span v-else>
            <i
                v-if="party.modes.includes('osu')"
                class="fas fa-circle"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="osu!"
            />
            <i
                v-if="party.modes.includes('taiko')"
                class="fas fa-drum"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="osu!taiko"
            />
            <i
                v-if="party.modes.includes('catch')"
                class="fas fa-apple-alt"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="osu!catch"
            />
            <i
                v-if="party.modes.includes('mania')"
                class="fas fa-stream"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="osu!mania"
            />
        </span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Party } from '../../../../interfaces/party';

export default Vue.extend({
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
            const party = await this.executePost(`/parties/${this.party.id}/toggleMode`, { mode });

            if (!this.isError(party)) {
                this.$store.dispatch('quests/updateParty', party);
            }
        },
    },
});
</script>
