<template>
    <div>
        <div class="container py-5">
            <div class="row">
                <div class="col-12 text-center landing">
                    <img
                        class="mb-5"
                        src="/images/mg-logo.png"
                        style="width: 300px; min-width: 300px;"
                    />
                    <h1>Mappers' Guild</h1>
                </div>

                <div v-if="!loggedInUser" class="col-12 text-center">
                    <a href="/api/login" class="btn btn-primary">
                        log in with your osu! account
                        <i class="fas fa-external-link-alt" />
                    </a>
                </div>
            </div>
        </div>

        <div class="container card card-body py-4 my-4">
            <h4>What is the Mappers' Guild?</h4>
            <div class="text-secondary">
                <a href="https://osu.ppy.sh/wiki/Community/Mappers_Guild" target="_blank">The Mappers' Guild</a> is a hub for beatmaps associated with <a href="https://osu.ppy.sh/beatmaps/artists" target="_blank">osu!'s Featured Artists</a>!
            </div>
            <hr />
            <div>For the latest info about Featured Artist mapping, check out the channels below on the <a href="https://discord.gg/ppy" target="_blank">osu! Discord server</a>.</div>
            <ul>
                <li>
                    <code>#featured-artists</code>
                    <ul>
                        <li>
                            Discussion and events related to Featured Artists
                        </li>
                        <li>
                            Quick feedback from the mapping community on your Featured Artist maps
                        </li>
                    </ul>
                </li>
                <li>
                    <code>#mappers-guild</code>
                    <ul>
                        <li>Mappers' Guild quest activity</li>
                        <li>Feed of newly ranked Mappers' Guild beatmaps</li>
                        <li>Mappers' Guild member announcements</li>
                        <li>Discussion, feedback and support related to the Mappers' Guild</li>
                    </ul>
                </li>
            </ul>
        </div>

        <div class="container card card-body py-4 my-4">
            <h4>How does the Mappers' Guild work?</h4>
            <h5>Rewards</h5>
            <div class="text-secondary small mb-2">
                Earn any of these profile badges (displayed on your osu! profile) by participating in the Mappers' Guild:
            </div>
            <div class="d-flex justify-content-around flex-wrap text-center my-3">
                <div class="p-2">
                    <img src="/images/rank1.png" class="osu-badge" />
                    <div class="text-secondary small">
                        Bronze (100 points)
                    </div>
                </div>
                <div class="p-2">
                    <img src="/images/rank2.png" class="osu-badge" />
                    <div class="text-secondary small">
                        Silver (250 points)
                    </div>
                </div>
                <div class="p-2">
                    <img src="/images/rank3.png" class="osu-badge" />
                    <div class="text-secondary small">
                        Gold (500 points)
                    </div>
                </div>
                <div class="p-2">
                    <img src="/images/rank4.png" class="osu-badge" />
                    <div class="text-secondary small">
                        Platinum (1000 points)
                    </div>
                </div>
                <div class="p-2">
                    <img src="/images/rank5.png" class="osu-badge" />
                    <div class="text-secondary small">
                        Unreal (2500 points)
                    </div>
                </div>
            </div>
            <h5 id="points">
                Points
            </h5>
            <div class="text-secondary small">
                Each reward is associated with a "points" value. You can earn points with any of the following contributions:
            </div>
            <div class="row small">
                <div class="col-lg-4">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th scope="col">
                                    Task
                                </th>
                                <th scope="col">
                                    Points
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td scope="row">
                                    Mapping <i>Easy</i> difficulty
                                </td>
                                <td scope="row">
                                    5<sup><a href="#" @click.prevent="highlight = 'map'">map</a></sup>
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Mapping <span class="normal">Normal</span> difficulty
                                </td>
                                <td scope="row">
                                    6<sup><a href="#" @click.prevent="highlight = 'map'">map</a></sup>
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Mapping <span class="hard">Hard</span> difficulty
                                </td>
                                <td scope="row">
                                    7<sup><a href="#" @click.prevent="highlight = 'map'">map</a></sup>
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Mapping <span class="insane">Insane</span> difficulty
                                </td>
                                <td scope="row">
                                    8<sup><a href="#" @click.prevent="highlight = 'map'">map</a></sup>
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Mapping <span class="expert">Expert</span> difficulty
                                </td>
                                <td scope="row">
                                    8<sup><a href="#" @click.prevent="highlight = 'map'">map</a></sup>
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    <span class="expert">Hitsounding</span> a mapset
                                </td>
                                <td scope="row">
                                    2<sup><a href="#" @click.prevent="highlight = 'hitsounds'">hitsounds</a></sup>
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Hosting mapset
                                </td>
                                <td scope="row">
                                    3
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Modding mapset
                                </td>
                                <td scope="row">
                                    1<sup><a href="#" @click.prevent="highlight = 'mod'">mod</a></sup>
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Creating storyboard
                                </td>
                                <td scope="row">
                                    10
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Completing a priority quest
                                </td>
                                <td scope="row">
                                    7, 10, 13, or 20<sup><a href="#" @click.prevent="highlight = 'priority'">priority</a></sup>
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Completing a quest
                                </td>
                                <td scope="row">
                                    7<sup><a href="#" @click.prevent="highlight = 'quest'">quest</a></sup>
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Contest Organization
                                </td>
                                <td scope="row">
                                    5<sup><a href="#" @click.prevent="highlight = 'contest'">contest</a></sup>
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Contest Participation
                                </td>
                                <td scope="row">
                                    3<sup><a href="#" @click.prevent="highlight = 'contest'">contest</a></sup>
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Contest Screening
                                </td>
                                <td scope="row">
                                    1<sup><a href="#" @click.prevent="highlight = 'contest'">contest</a></sup>
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Contest Judging
                                </td>
                                <td scope="row">
                                    1<sup><a href="#" @click.prevent="highlight = 'contest'">contest</a></sup>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="col-lg-8 text-secondary">
                    <ul>
                        <li>
                            <b>General:</b>
                            <ul>
                                <li>Points are rewarded when a map reaches Ranked status</li>
                            </ul>
                        </li>
                        <li :class="highlight == 'map' ? 'text-success' : ''">
                            <b>Map:</b>
                            <ul>
                                <li>Points for <a href="/beatmaps">creating beatmaps</a> scale according to a map's length (longer map = more points, shorter map = fewer points).</li>
                                <li>Collaborative difficulties split points evenly between all mappers.</li>
                                <li :class="highlight == 'above' ? 'text-success' : ''">
                                    Beatmaps assigned to a quest earn +2 points per difficulty (also scaling according to length). If the map is ranked after the quest's deadline, this bonus will be reduced:
                                    <ul>
                                        <li>1.5 points for 0-20 days late</li>
                                        <li>1 point for 21-40 days late</li>
                                        <li>0.5 points for 40+ days late </li>
                                    </ul>
                                </li>
                                <li>Beatmaps created for a priority quest earn +2 for winning (also scaling according to length)</li>
                            </ul>
                        </li>
                        <li :class="highlight == 'hitsounds' ? 'text-success' : ''">
                            <b>Hitsounds:</b>
                            <ul>
                                <li>This assumes a mapset uses one set of hitsounds for all difficulties. If different difficulties use different hitsounds, points can't be allocated accordingly.</li>
                                <li>Points scale according to song's length.</li>
                            </ul>
                        </li>
                        <li :class="highlight == 'mod' ? 'text-success' : ''">
                            <b>Modding:</b>
                            <ul>
                                <li>
                                    If a Beatmap Nominator nominates a Mappers' Guild map, this value scales according to the song's length
                                </li>
                            </ul>
                        </li>
                        <li :class="highlight == 'priority' ? 'text-success' : ''">
                            <b>Priority quest:</b>
                            <ul>
                                <li>Unlike normal quests, priority quests do not need to be claimed. Anyone can participate so long as they meet the labeled criteria.</li>
                                <li>Win conditions for each priority quest are highly variable. Higher tier priority quests are generally more difficult, but yield more points:</li>
                                    <ul>
                                        <li>
                                            <img
                                                class="tier-example me-1"
                                                :src="'/images/bronze.png'"
                                            />
                                            <b>Tier 1:</b> 7 points
                                        </li>
                                        <li>
                                            <img
                                                class="tier-example me-1"
                                                :src="'/images/silver.png'"
                                            />
                                            <b>Tier 2:</b> 10 points
                                        </li>
                                        <li>
                                            <img
                                                class="tier-example me-1"
                                                :src="'/images/gold.png'"
                                            />
                                            <b>Tier 3:</b> 13 points
                                        </li>
                                        <li>
                                            <img
                                                class="tier-example me-1"
                                                :src="'/images/platinum.png'"
                                            />
                                            <b>Tier 4:</b> 20 points
                                        </li>
                                    </ul>
                                <li>See the <a href="/missions">priority quest listing</a> for additional badge + physical prizes.</li>
                            </ul>
                        </li>
                        <li :class="highlight == 'quest' ? 'text-success' : ''">
                            <b>Quest:</b>
                            <ul>
                                <li><a href="/quests">Quests</a> have deadlines. If a quest is completed before its deadline, each participating user earns 7 points.</li>
                                <li>Beatmaps earn quest bonuses regardless of whether or not the quest is overdue, as outlined <a href="#" @click.prevent="highlight = 'above'">above</a>.</li>
                            </ul>
                        </li>
                        <li :class="highlight == 'contest' ? 'text-success' : ''">
                            <b>Contest:</b>
                            <ul>
                                <li>Beatmapping contests can be hosted through the <a href="/contests/listing">Mappers' Guild contest listing</a>.</li>
                                <li>Points earned through contest-related contributions only apply to contests that <b>exclusively use Featured Artist content</b>.</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
            <hr />
            <h5>Priority quests</h5>
            <div class="text-secondary small">
                <b>Priority quests</b> are a new addition to the Mappers' Guild. While normal quests focus on simply ranking maps, priority quests have different objectives to encourge creative mapping ventures (oh, and they feature cool custom prizes). Here's an example:
            </div>
            <example-mission
                    :mission="exampleMission"
                />
            <div class="text-secondary small">
                See the <a href="/missions">priority quest listing</a> to see what quests are available and what prizes you can earn!
                <div>
                    <a href="/missions">
                        <img
                            class="text-center w-25 ms-4 rounded"
                            :src="'/images/keychain.jpg'"
                        />
                    </a>
                </div>
            </div>
            <hr />
            <h5>Quests</h5>
            <div class="text-secondary small">
                You can earn extra points by mapping songs by specific osu! Featured Artists through <a href="/quests">Quests</a>. Here's an example:
            </div>

            <example-quest
                :quest="exampleQuest"
            />

            <div class="text-secondary small">
                Quests are created weekly for every new osu! Featured Artist. See the <a href="/quests">quest listing</a> and explore what quests are available!
            </div>
            <hr />
            <h5>Contests</h5>
            <div class="text-secondary small">
                The <a href="/contests/listing">Mappers' Guild contest listing</a> serves as a central location for beatmap contest management. It includes:
                <ul>
                    <li>A list of all ongoing contests (so mappers can find your contest!)</li>
                    <li>Beatmap submission form</li>
                    <li>Beatmap anonymization tools</li>
                    <li>Judging tools</li>
                    <li>Results automation</li>
                </ul>
                The goal of the <a href="/contests/listing">Mappers' Guild contest listing</a> is to make contests less of a hassle to run, so if you have a special need for your contest, talk to <a href="https://osu.ppy.sh/community/chat?channel_id=3178418" target="_blank">pishifat</a> about new features!
            </div>

            <div v-if="!loggedInUser">
                <div>
                    <h5>How do I join the Mappers' Guild?</h5>
                    <p class="text-secondary">
                       Anyone can get involved in the Mappers' Guild by clicking the button below and authenticating through your osu! login.
                    </p>
                    <p class="text-secondary">
                        Additionally, we recommend reading the <a href="/faq">frequently asked questions</a> page to better understand what you may be doing as a member of the Mappers' Guild.
                    </p>
                </div>
                <div class="col-12 text-center">
                    <a href="/api/login" class="btn btn-primary">Verify osu! account</a>
                </div>
            </div>
        </div>

        <div class="radial-divisor" />

        <div class="container">
            <div class="row">
                <div class="col-12 text-center landing">
                    <h5>recent featured artists</h5>
                </div>
            </div>
        </div>

        <div class="container pt-4">
            <transition-group tag="div" class="row justify-content-around" name="list">
                <div
                    v-for="artist in homeArtists"
                    :key="artist._id"
                    class="col-md-6 col-lg-4"
                >
                    <div class="d-flex flex-column text-center">
                        <div style="z-index: 1;">
                            <a :href="`https://osu.ppy.sh/beatmaps/artists/${artist.osuId}`" target="_blank" style="box-shadow: 1px 1px 3px 0px rgba(50, 50, 50, 0.2);">
                                <img
                                    class="img-fluid rounded mx-auto"
                                    :src="`https://assets.ppy.sh/artists/${artist.osuId}/cover.jpg`"
                                    :alt="artist.label"
                                    :title="artist.label"
                                    style="max-width: 170px; width: 170px; height: 170px"
                                    @error="fallbackImg"
                                />
                            </a>
                        </div>
                        <div class="card card-body card-home-showcase small">
                            <template v-for="song in artist.songs">
                                <template
                                    v-for="beatmap in song.beatmaps"
                                    :key="beatmap.id"
                                >
                                    <a
                                        v-if="beatmap.url"
                                        :href="beatmap.url"
                                        target="_blank"
                                    >
                                        {{ song.title }} by {{ beatmap.host.username }}
                                    </a>
                                    <span v-else>{{ song.title }} by {{ beatmap.host.username }}</span>
                                </template>
                            </template>
                        </div>
                    </div>
                </div>

                <div class="text-center">
                    <button
                        class="btn btn-sm btn-primary"
                        type="button"
                        @click="showMore($event)"
                    >
                        <i class="fas fa-angle-down me-1" /> show more artists <i class="fas fa-angle-down ms-1" />
                    </button>
                </div>
            </transition-group>
        </div>

        <div class="radial-divisor" />

        <div class="text-center" style="margin-bottom: 50px;">
            <img src="/images/mg-logo.png" style="width:171px; height: 150px; margin-top: 50px;" />
        </div>

        <a
            href="https://bn.mappersguild.com/"
            class="btn btn-sm btn-primary"
            style="
                position: fixed;
                z-index: 1060;
                right: 20px;"
            :style="loggedInUser ? 'bottom: 20px;' : 'bottom: 20px;'"
        >
            visit BN/NAT site
        </a>
    </div>
</template>

<script lang="ts">
import { FeaturedArtist } from '@interfaces/featuredArtist';
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { Quest } from '@interfaces/quest';
import { Mission } from '@interfaces/mission';
import ExampleQuest from '@components/quests/ExampleQuest.vue';
import ExampleMission from '@components/missions/ExampleMission.vue';

export default defineComponent({
    components: {
        ExampleQuest,
        ExampleMission,
    },
    data () {
        return {
            highlight: '',
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
            'homeArtists',
            'exampleQuest',
            'exampleMission',
            'limit',
        ]),
    },
    async created () {
        const [artists, quest, mission] = await Promise.all<any>([
            this.$http.executeGet<FeaturedArtist[]>('/home/' + this.limit),
            this.$http.executeGet<Quest>('/exampleQuest'),
            this.$http.executeGet<Mission>('/exampleMission'),
        ]);

        if (!this.$http.isError(artists)) {
            this.$store.commit('setHomeArtists', artists);
            this.$store.commit('setLimit', this.limit + 12);
        }

        if (!this.$http.isError(quest)) {
            this.$store.commit('setExampleQuest', quest);
        }

        if (!this.$http.isError(mission)) {
            this.$store.commit('setExampleMission', mission);
        }
    },
    methods: {
        fallbackImg (e) {
            e.target.src = '/images/no-art-icon.png';
        },
        async showMore (e) {
            const artists = await this.$http.executeGet<{ artists: FeaturedArtist[] }>('/home/' + this.limit, e);

            if (!this.$http.isError(artists)) {
                this.$store.commit('setHomeArtists', artists);
                this.$store.commit('setLimit', this.limit + 12);
            }
        },
    },
});
</script>

<style scoped>
.tier-example {
    max-width: 15px;
    max-height: 15px;
    object-fit: cover;
}
</style>