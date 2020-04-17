<template>
    <p class="small text-shadow min-spacing ml-3 mt-1">
        Modes:
        <span v-if="party.leader.id == $store.state.userId">
            <a href="#" @click.prevent="togglePartyMode(party.id, 'osu')">
                <i
                    class="fas fa-circle"
                    :class="party.modes.includes('osu') ? '' : 'text-white-50'"
                    data-toggle="tooltip"
                    data-placement="top"
                    title="toggle osu!"
                />
            </a>
            <a href="#" @click.prevent="togglePartyMode(party.id, 'taiko')">
                <i
                    class="fas fa-drum"
                    :class="party.modes.includes('taiko') ? '' : 'text-white-50'"
                    data-toggle="tooltip"
                    data-placement="top"
                    title="toggle osu!taiko"
                />
            </a>
            <a href="#" @click.prevent="togglePartyMode(party.id, 'catch')">
                <i
                    class="fas fa-apple-alt"
                    :class="party.modes.includes('catch') ? '' : 'text-white-50'"
                    data-toggle="tooltip"
                    data-placement="top"
                    title="toggle osu!catch"
                />
            </a>
            <a href="#" @click.prevent="togglePartyMode(party.id, 'mania')">
                <i
                    class="fas fa-stream"
                    :class="party.modes.includes('mania') ? '' : 'text-white-50'"
                    data-toggle="tooltip"
                    data-placement="top"
                    title="toggle osu!mania"
                />
            </a>
        </span>
        <span v-else>
            <i
                v-if="party.modes.includes('osu')"
                class="fas fa-circle"
                data-toggle="tooltip"
                data-placement="top"
                title="osu!"
            />
            <i
                v-if="party.modes.includes('taiko')"
                class="fas fa-drum"
                data-toggle="tooltip"
                data-placement="top"
                title="osu!taiko"
            />
            <i
                v-if="party.modes.includes('catch')"
                class="fas fa-apple-alt"
                data-toggle="tooltip"
                data-placement="top"
                title="osu!catch"
            />
            <i
                v-if="party.modes.includes('mania')"
                class="fas fa-stream"
                data-toggle="tooltip"
                data-placement="top"
                title="osu!mania"
            />
        </span>
    </p>
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
        async togglePartyMode(partyId, mode): Promise<void> {
            const quest = await this.executePost('/quests/togglePartyMode/' + partyId + '/' + this.questId, { mode });

            if (quest) {
                this.$store.dispatch('updateQuest', quest);
            }
        },
    },
});
</script>
