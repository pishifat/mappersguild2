<template>
    <div
        :id="`mission${mission.id}`"
        class="col-sm-12"
        @click="selectMission"
    >
        <div
            class="card card-level-2 card-body mb-3"
        >
            <img :src="findTierImage" class="card-mission-tier" />

            <div class="ms-3 row my-1">
                <h5 class="col-sm-12">
                    {{ mission.name.trim() }}
                    <span v-if="mission.modes && mission.modes.length && mission.modes.length < 4" class="text-secondary small">({{ cleanModes.join(', ') + ' only' }})</span>
                    <span :id="`copy${mission.id}`" class="text-secondary opacity-0 ms-2 small pe-none">(copied link)</span>
                </h5>
                <hr />

                <mission-details
                    class="col-sm-6"
                    :mission="mission"
                />

                <div class="col-sm-6">
                    <add-beatmap-to-mission
                        v-if="mission.status == 'open'"
                        :mission="mission"
                        @click.stop
                    />
                    <associated-beatmaps
                        :mission="mission"
                        @click.stop
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { Mission, MissionMode } from '@interfaces/mission';
import AssociatedBeatmaps from '@components/missions/AssociatedBeatmaps.vue';
import AddBeatmapToMission from '@components/missions/AddBeatmapToMission.vue';
import MissionDetails from '@components/missions/MissionDetails.vue';

export default defineComponent({
    name: 'MissionCard',
    components: {
        AssociatedBeatmaps,
        AddBeatmapToMission,
        MissionDetails,
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
        cleanModes(): string[] {
            const cleanModes: string[] = [];

            for (const mode of this.mission.modes) {
                switch (mode) {
                    case MissionMode.Osu:
                        cleanModes.push('osu!');
                        break;
                    case MissionMode.Taiko:
                        cleanModes.push('osu!taiko');
                        break;
                    case MissionMode.Catch:
                        cleanModes.push('osu!catch');
                        break;
                    case MissionMode.Mania:
                        cleanModes.push('osu!mania');
                        break;
                    default:
                        break;
                }
            }

            return cleanModes;
        },
    },
    methods: {
        async selectMission(): Promise<void> {
            this.$store.commit('missions/setSelectedMissionId', this.mission.id);

            if (this.$route.query.id !== this.mission.id) {
                this.$router.replace(`/missions?id=${this.mission.id}`);
            }

            const el = document.querySelector(`#copy${this.mission.id}`);

            if (el) {
                el.classList.remove('opacity-0');
                el.classList.add('animate-flicker');
                await setTimeout(() => {
                    el.classList.remove('animate-flicker');
                    el.classList.add('opacity-0');
                }, 1000);
                navigator.clipboard.writeText(`https://mappersguild.com/missions?id=${this.mission.id}`);
            }
        },
    },
});
</script>

<style scoped>
.card-mission-tier {
    position: absolute;
    top: 30px;
    left: -30px;
    max-width: 100px;
    max-height: 100px;
    object-fit: cover;
}

.card-body {
    padding: 0.5rem 1rem 0.5rem 3.5rem;
}
@keyframes flickerAnimation {
    0%    { opacity: 1; }
    100%   { opacity: 0; }
}

@-moz-keyframes flickerAnimation {
    0%    { opacity: 1; }
    100%   { opacity: 0; }
}

@-webkit-keyframes flickerAnimation {
    0%    { opacity: 1; }
    100%   { opacity: 0; }
}

.animate-flicker {
    -webkit-animation: flickerAnimation 1.1s;
    -moz-animation: flickerAnimation 1.1s;
    animation: flickerAnimation 1.1s;
}
</style>
