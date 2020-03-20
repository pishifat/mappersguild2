<template>
    <div
        :id="'details-' + quest.id"
        class="collapse"
    >
        <div class="card-body static-card">
            <div class="row">
                <div :class="quest.status == 'open' ? 'col-sm-12' : 'col-sm-6'">
                    <button
                        v-if="quest.status == 'open' && !memberOfAnyParty"
                        class="btn btn-sm btn-block btn-outline-info mb-2"
                        @click.prevent="createParty($event)"
                    >
                        Add party <i class="fas fa-plus small" />
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
        availablePoints: {
            type: Number,
            default: 0,
        },
        test: {
            type: Number,
            default: 0,
        },
        memberOfAnyParty: Boolean,
    },
    methods: {
        async createParty(e): Promise<void> {
            const quest = await this.executePost('/quests/createParty/' + this.quest.id, {}, e);

            if (!this.isError(quest)) {
                this.$store.commit('updateQuest', quest);
            }
        },
    },
});
</script>
