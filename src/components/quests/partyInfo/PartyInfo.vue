<template>
    <div class="container">
        <div v-if="isOpen && !memberOfAnyParty" class="row">
            <div class="col">
                <button

                    class="btn btn-sm w-100 btn-outline-info mb-2"
                    @click.prevent="createParty($event)"
                >
                    Add party <i class="fas fa-plus fa-xs" />
                </button>
            </div>
        </div>
        <div
            v-for="party in quest.parties"
            :key="party.id"
            class="row"
        >
            <div class="col-sm-12">
                <party-detail
                    :party="party"
                    :quest="quest"
                    :member-of-any-party="memberOfAnyParty"
                />
            </div>

            <div
                v-if="isDone || isWip"
                class="col-sm-12 mt-2"
            >
                <associated-beatmaps
                    :associated-maps="quest.associatedMaps"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Quest } from '../../../../interfaces/quest';
import PartyDetail from './PartyDetail.vue';
import AssociatedBeatmaps from './AssociatedBeatmaps.vue';
import partyInfoMixin from './partyInfoMixin';

export default Vue.extend({
    components: {
        PartyDetail,
        AssociatedBeatmaps,
    },
    mixins: [ partyInfoMixin ],
    props: {
        quest: {
            type: Object as () => Quest,
            required: true,
        },
        memberOfAnyParty: Boolean,
        collapse: Boolean,
    },
    methods: {
        async createParty(e): Promise<void> {
            const quest = await this.executePost('/parties/create', {
                questId: this.quest.id,
            }, e);

            if (!this.isError(quest)) {
                this.$store.dispatch('quests/updateQuest', quest);
            }
        },
    },
});
</script>
