<template>
    <div
        :id="collapse ? 'details-' + quest.id : 'details-modal-' + quest.id"
        :class="collapse ? 'collapse' : 'show'"
    >
        <div class="card-body">
            <div class="row">
                <div :class="quest.status == 'open' ? 'col-sm-12' : 'col-sm-6'">
                    <button
                        v-if="quest.status == 'open' && !memberOfAnyParty"
                        class="btn btn-sm btn-block btn-outline-info mb-2"
                        @click.prevent="createParty($event)"
                    >
                        Add party <i class="fas fa-plus fa-xs" />
                    </button>

                    <!-- open -->
                    <template v-if="quest.status == 'open'">
                        <party-detail
                            v-for="party in quest.parties"
                            :key="party.id"
                            :party="party"
                            :quest="quest"
                            :member-of-any-party="memberOfAnyParty"
                        />
                    </template>

                    <!-- wip -->
                    <party-detail
                        v-else-if="quest.status == 'wip'"
                        :party="quest.currentParty"
                        :quest="quest"
                        :member-of-any-party="memberOfAnyParty"
                    />

                    <!-- done -->
                    <party-detail
                        v-else
                        :quest="quest"
                    />

                    <!-- fa promo will not appear in modal -->
                    <p class="small">
                        <a v-if="quest.art && collapse" :href="'https://osu.ppy.sh/beatmaps/artists/' + quest.art" target="_blank">
                            View featured artist listing
                        </a>
                    </p>

                    <!-- quest expiration date -->
                    <expiration-date
                        v-if="quest.status == 'open'"
                        :is-expired="quest.isExpired"
                        :expiration="new Date(quest.expiration)"
                    />
                </div>



                <div
                    v-if="quest.status == 'done' || quest.status == 'wip'"
                    class="col-sm-6"
                >
                    <associated-beatmaps
                        :associated-maps="quest.associatedMaps"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Quest } from '../../../../interfaces/quest';
import PartyDetail from './PartyDetail.vue';
import AssociatedBeatmaps from './AssociatedBeatmaps.vue';
import ExpirationDate from '../expirationInfo/ExpirationDate.vue';

export default Vue.extend({
    components: {
        PartyDetail,
        AssociatedBeatmaps,
        ExpirationDate,
    },
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
            const quest = await this.executePost('/quests/createParty/' + this.quest.id, {}, e);

            if (!this.isError(quest)) {
                this.$store.dispatch('updateQuest', quest);
            }
        },
    },
});
</script>
