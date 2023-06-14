<template>
    <div :id="`#${mission.id}`" class="col-sm-12">
        <div
            class="card card-level-2 card-body mb-3"
        >
            <img :src="findTierImage" class="card-mission-tier" />

            <div class="ms-3 row my-1">
                <h5 class="col-sm-12">
                    {{ mission.name }}
                </h5>
                <hr />

                <div class="col-sm-6 row">
                    <div class="col-sm-12 mb-2">
                        <b>Objective:</b>
                        <span class="text-secondary ms-1">{{ mission.objective }}</span>
                    </div>
                    <div class="col-sm-12 mb-2">
                        <b>Win condition:</b>
                        <span class="text-secondary ms-1">{{ mission.winCondition }}</span>
                    </div>
                    <div v-if="userRequirements.length" class="col-sm-12 mb-2">
                        <b>Requirements:</b> <span class="text-danger small">{{ meetsRequirements ? '' : `(you can't participate for one or more of these reasons)` }}</span>
                        <ul :class="meetsRequirements ? 'text-secondary' : 'text-danger'">
                            <li v-for="requirement in userRequirements" :key="requirement">
                                {{ requirement.text }} <b>{{ requirement.bold }}</b>
                            </li>
                        </ul>
                    </div>
                    <hr />
                    <div class="col-sm-12 small">
                        <b>Deadline:</b>
                        <span class="text-secondary ms-1">{{ new Date(mission.deadline).toLocaleString() }}</span>
                    </div>
                    <div class="col-sm-12 small">
                        <b>Applicable Featured Artists:</b>
                        <span v-if="mission.artists && mission.artists.length" class="text-secondary ms-1">
                            <artist-link-list
                                :artists="mission.artists"
                            />
                        </span>
                        <span v-else class="text-secondary ms-1">Any. See the <a href="https://osu.ppy.sh/beatmaps/artists" target="_blank">full Featured Artist listing</a>.</span>
                        <div v-if="mission.artists && mission.artists.length">
                            <a
                                v-for="artist in mission.artists"
                                :key="artist.id"
                                :href="`https://osu.ppy.sh/beatmaps/artists/${artist.osuId}`"
                                target="_blank"
                            >
                                <img
                                    v-bs-tooltip="artist.label"
                                    :src="`https://assets.ppy.sh/artists/${artist.osuId}/cover.jpg`"
                                    class="artist-avatar me-2 my-1"
                                />
                            </a>
                        </div>
                    </div>
                </div>

                <div class="col-sm-6">
                    <add-beatmap-to-mission
                        v-if="meetsRequirements"
                        :mission-id="mission.id"
                    />
                    <associated-beatmaps
                        :mission-id="mission.id"
                        :mission-status="mission.status"
                        :associated-maps="mission.associatedMaps || []"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { Mission } from '../../../interfaces/mission';
import ArtistLinkList from '@components/ArtistLinkList.vue';
import AssociatedBeatmaps from '@components/missions/AssociatedBeatmaps.vue';
import AddBeatmapToMission from '@components/missions/AddBeatmapToMission.vue';

export default defineComponent({
    name: 'MissionCard',
    components: {
        ArtistLinkList,
        AssociatedBeatmaps,
        AddBeatmapToMission,
    },
    props: {
        mission: {
            type: Object as () => Mission,
            required: true,
        },
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        findTierImage(): string {
            switch (this.mission.tier) {
                case 1:
                    return '/images/bronze.png';
                case 2:
                    return '/images/silver.png';
                case 3:
                    return '/images/gold.png';
                case 4:
                    return '/images/platinum.png';
                default:
                    return '/images/bronze.png';
            }
        },
        userRequirements(): any[] {
            let requirements: any = [];

            if (this.mission.userMaximumRankedBeatmapsCount || this.mission.userMaximumRankedBeatmapsCount === 0) {
                requirements.push({
                    text: `You must have no more than `,
                    bold: `${this.mission.userMaximumRankedBeatmapsCount} ranked beatmaps`,
                });
            }

            if (this.mission.userMaximumGlobalRank) {
                requirements.push({
                    text: `You must be worse than `,
                    bold: `${this.mission.userMaximumGlobalRank} global rank`,
                });
            }

            return requirements;
        },
        meetsRequirements(): boolean {
            if (this.mission.userMaximumRankedBeatmapsCount && this.loggedInUser.rankedBeatmapsCount > this.mission.userMaximumRankedBeatmapsCount) {
                return false;
            }

            if (this.mission.userMaximumGlobalRank && this.loggedInUser.globalRank < this.mission.userMaximumGlobalRank) {
                return false;
            }

            return true;
        },
    },
});
</script>

<style scoped>
.card-mission-tier {
    position: absolute;
    top: calc(50% - 50px);
    left: -30px;
    max-width: 100px;
    max-height: 100px;
    object-fit: cover;
}

.card-body {
    padding: 0.5rem 1rem 0.5rem 3.5rem;
}

.artist-avatar {
    max-width: 50px;
    max-height: 50px;
    object-fit: cover;
    border-radius: 10%;
    box-shadow: 0 1px 0.5rem rgb(10, 10, 25);
    background-color: rgb(10, 10, 25);
}
</style>
