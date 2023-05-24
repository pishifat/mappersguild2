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
                        connect your osu! account
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
            <div>For the latest info about Featured Artist mapping, check out the channels below on the <a href="https://discord.gg/ppy" target="_blank">osu!dev Discord server</a>.</div>
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
            <div class="row text-center mb-3">
                <div class="col-md-3">
                    <img src="/images/rank1.png" class="osu-badge" />
                    <div class="text-secondary small">
                        Bronze (100 points)
                    </div>
                </div>
                <div class="col-md-3">
                    <img src="/images/rank2.png" class="osu-badge" />
                    <div class="text-secondary small">
                        Silver (250 points)
                    </div>
                </div>
                <div class="col-md-3">
                    <img src="/images/rank3.png" class="osu-badge" />
                    <div class="text-secondary small">
                        Gold (500 points)
                    </div>
                </div>
                <div class="col-md-3">
                    <img src="/images/rank4.png" class="osu-badge" />
                    <div class="text-secondary small">
                        Platinum (1000 points)
                    </div>
                </div>
            </div>
            <h5>Points</h5>
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
                                    Hosting mapset
                                </td>
                                <td scope="row">
                                    5
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Modding mapset
                                </td>
                                <td scope="row">
                                    1
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Creating storyboard
                                </td>
                                <td scope="row">
                                    2.5, 7, or 10<sup><a href="#" @click.prevent="highlight = 'storyboard'">storyboard</a></sup>
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Completing a bounty
                                </td>
                                <td scope="row">
                                    variable<sup><a href="#" @click.prevent="highlight = 'bounty'">bounty</a></sup>
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
                            </ul>
                        </li>
                        <li :class="highlight == 'storyboard' ? 'text-success' : ''">
                            <b>Storyboard:</b>
                            <ul>
                                <li>
                                    Points are determined based storyboard content:
                                    <ul>
                                        <li>2 points for minimalist storyboard</li>
                                        <li>7.5 points for typical storyboard</li>
                                        <li>10 points for extraordinary storyboard</li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                        <li :class="highlight == 'bounty' ? 'text-success' : ''">
                            <b>Bounty:</b>
                            <ul>
                                <li>Each bounty has its own associated reward. See the <b>bounties listing</b> for the list of currently running bounties.</li>
                                <li>Bounties don't exist yet :) Expect to see them in March 2023</li>
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
                                <li>Beatmapping contests can be hosted trough the <a href="/contests/listing">Mappers' Guild contest listing</a>.</li>
                                <li>Points earned through contest-related contributions only apply to contests that <b>exclusively use Featured Artist content</b>.</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
            <hr />
            <h5>Quests</h5>
            <div class="text-secondary small">
                You can earn extra points by mapping songs by specific osu! Featured Artists through <a href="/quests">Quests</a>. Here's an example:
            </div>
            <quest-card
                v-if="exampleQuest"
                :key="exampleQuest.id"
                :quest="exampleQuest"
                style="pointer-events: none;"
            />
            <div class="text-secondary small">
                <ul>
                    <li><b>Quest name:</b> {{ exampleQuest.name }}</li>
                    <li><b>Quest objective:</b> {{ exampleQuest.descriptionMain }}</li>
                    <li>
                        <b>Quest size:</b> <quest-size
                            :quest="exampleQuest"
                        />
                        (Quest requires a party of at least {{ exampleQuest.minParty }} users and may have up to {{ exampleQuest.maxParty }} users)
                    </li>
                    <li>
                        <b>Quest price:</b> <quest-price
                            :quest="exampleQuest"
                        />
                        (Quest requires {{ exampleQuest.price }} points from each party member to participate)
                    </li>
                    <li>
                        <b>Quest deadline:</b> <quest-time
                            :timeframe="exampleQuest.timeframe"
                        />
                        (Quest must be completed in {{ Math.round(exampleQuest.timeframe / (1000*60*60*24)) }} days to earn maximum points)
                    </li>
                    <li>
                        <b>Quest modes:</b> <quest-modes
                            :status="exampleQuest.status"
                            :modes="exampleQuest.modes"
                        />
                        (Quest is available for these modes)
                    </li>
                </ul>
            </div>
            <div class="text-secondary small">
                Quests are created weekly for every new osu! Featured Artist. See the <a href="/quests">quest listing</a> and explore what quests are available!
            </div>
            <hr />
            <!--<h5>Bounties</h5>
            <div class="text-secondary small">
                <b>Bounties</b> are an upcoming addition to the Mappers' Guild (likely in March 2023). Here's an outline of how they will (probably) work:
                <ul>
                    <li>Bounties are similar to quests (both require maps to meet certain criteria), but they <i>cannot</i> be reserved by a party.</li>
                    <li>Only <b>3 bounties</b> can be running at any given time.</li>
                    <li>
                        Bounties can be completed under any of these conditions (specified per bounty):
                        <ul>
                            <li><b>Complete: </b>The bounty's requirement is completed.</li>
                            <li><b>Time limit: </b>The bounty's time limit is reached.</li>
                        </ul>
                    </li>
                    <li>A bounty's reward is specified per bounty. Due to the volatility and rarity of bounties, they yield higher rewards than quests.</li>
                </ul>
            </div>
            <hr />-->
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
                        If you have 3 or more ranked maps, you can join the Mappers' Guild by clicking the button below and authenticating through your osu! login. If you don't meet the requirements, you can still view the pages, but you can't interact with them!
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
import { Quest } from '@interfaces/quest';
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import QuestCard from '@components/quests/QuestCard.vue';
import QuestSize from '@components/quests/QuestSize.vue';
import QuestPrice from '@components/quests/QuestPrice.vue';
import QuestTime from '@components/quests/QuestTime.vue';
import QuestModes from '@components/quests/QuestModes.vue';

export default defineComponent({
    components: {
        QuestCard,
        QuestSize,
        QuestPrice,
        QuestTime,
        QuestModes,
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
            'limit',
        ]),
    },
    async created () {
        const data = await this.$http.executeGet<{ artists: FeaturedArtist[], quest: Quest }>('/home/' + this.limit);

        if (!this.$http.isError(data)) {
            this.$store.commit('setHomeArtists', data.artists);
            this.$store.commit('setLimit', this.limit + 6);
            this.$store.commit('setExampleQuest', data.quest);
        }

        console.log(this.exampleQuest);
    },
    methods: {
        fallbackImg (e) {
            e.target.src = '/images/no-art-icon.png';
        },
        async showMore (e) {
            const data = await this.$http.executeGet<{ artists: FeaturedArtist[] }>('/home/' + this.limit, e);

            if (!this.$http.isError(data)) {
                this.$store.commit('setHomeArtists', data.artists);
                this.$store.commit('setLimit', this.limit + 6);
            }
        },
    },
});
</script>
