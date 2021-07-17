<template>
    <div>
        <div class="container py-5">
            <div class="row">
                <div class="col-12 text-center landing">
                    <img
                        class="mb-5"
                        src="/images/mg-logo.png"
                        style="width: 300px; min-width: 300px;"
                    >
                    <h1>Mappers' Guild</h1>
                    <h5>learn more below</h5>
                </div>

                <div v-if="!loggedInUser" class="col-12 text-center">
                    <a href="/login" class="btn btn-primary">
                        connect your osu! account
                        <i class="fas fa-external-link-alt" />
                    </a>
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
                                >
                            </a>
                        </div>
                        <div class="card card-body card-home-showcase small">
                            <template v-for="song in artist.songs">
                                <template
                                    v-for="beatmap in song.beatmaps"
                                    :key="beatmap.id"
                                    :href="beatmap.url"
                                    target="_blank"
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

        <div class="container card card-body py-4">
            <div class="row">
                <div class="col-md-6">
                    <h4>What is the Mappers' Guild?</h4>
                    <p class="text-secondary">
                        In short, it's a group of mappers responsible for creating maps for osu!'s featured artists! You may have seen our maps included in map pack/hush hush medals, as well as news posts like...
                    </p>
                    <ul>
                        <li><a href="https://osu.ppy.sh/home/news/2017-11-07-new-featured-artist-motoloid">MOtOLOiD Featured Artist release</a></li>
                        <li><a href="https://osu.ppy.sh/home/news/2018-08-13-new-featured-artist-high-tea-music">High Tea Music Featured Artist release</a></li>
                        <li><a href="https://osu.ppy.sh/home/news/2019-02-05-new-featured-artist-hyun">HyuN Featured Artist release</a></li>
                    </ul>
                    <p class="text-secondary">
                        The Mappers' Guild has expanded from its initial 40 users to more than 500 today. Through this website and automated functionality, we're now able to bring in more mappers (potentially including you)!
                    </p>
                </div>

                <div class="col-md-6" style="object-fit: cover;">
                    <img src="/images/mappers-guild-sets.jpg" style="width:100%; border-radius:4px 4px 4px 4px">
                    <a href="https://osu.ppy.sh/home/news/2018-05-25-new-featured-artist-cranky" class="small float-end my-2 me-3"><b>example Mappers' Guild content</b></a>
                </div>
            </div>
        </div>

        <div class="radial-divisor" />

        <div class="container card card-body py-4">
            <div class="row">
                <div class="col-lg-12">
                    <h4>How does the Mappers' Guild work?</h4>
                    <p class="text-secondary">
                        In addition to making maps of music licensed by osu!, the Mappers' Guild has similaritiess to any other MMO-style guild.
                        We support subgroups of mappers (parties) working together to create map packs for specifically assigned artists or other content (quests).
                        By creating maps and participating in the mapping process, a user can earn points and level up to receive rewards!
                    </p>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <h5>Quests</h5>
                    <ul class="text-secondary">
                        <li>Quests reward mappers for following certain requirements when creating their featured artist beatmaps.</li>
                        <li>For example, a quest's objective could be "create 5 mapsets of songs from Camellia", necessitating a party of 5-10 members and completion within 3 months.</li>
                        <li>If a party accepts and completes the quest according to its rules, each party member will be rewarded point bonuses. If a party drops the quest, they will lose points.</li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h5>Parties</h5>
                    <ul class="text-secondary">
                        <li>Parties are groups of mappers who register to complete quests together.</li>
                        <li>Special quests require higher ranks to participate in. For a party to qualify as a higher rank, at least half of its members must be the required rank or higher.</li>
                    </ul>
                </div>
            </div>

            <div class="row">
                <div class="col">
                    <p class="text-secondary">
                        Quests and parties are rewarding ways to get involved with the Mappers' Guild, however our main goal is to produce maps for osu!'s featured artists, and that can be done however you prefer!
                    </p>
                </div>
            </div>
        </div>

        <div class="radial-divisor" />

        <div class="container card card-body py-4">
            <h4>Why join the Mappers' Guild?</h4>
            <p class="text-secondary">
                By creating maps through the Mappers' Guild that abide by our rules, you can earn rewards!
            </p>

            <div class="row">
                <div class="col-lg-12">
                    <h5>Profile badge</h5>
                    <p class="text-secondary">
                        Depending on a user's rank within the Mappers' Guild, they can have access to special quests + upcoming Featured Artist showcase opportunities (unlocked at rank 1) and the ability to design quests (unlocked at rank 2). Additionally, ranked users earn one of three profile badges:
                    </p>
                </div>
            </div>

            <div class="row text-center mb-3">
                <div class="col-md-4">
                    <p>Bronze (100 points)</p>
                    <img src="/images/rank1.png" class="osu-badge">
                </div>
                <div class="col-md-4">
                    <p>Silver (250 points)</p>
                    <img src="/images/rank2.png" class="osu-badge">
                </div>
                <div class="col-md-4">
                    <p>Gold (500 points)</p>
                    <img src="/images/rank3.png" class="osu-badge">
                </div>
            </div>

            <div class="row">
                <div class="col-sm-12">
                    <p class="text-secondary">
                        Points are earned through a few different Mappers' Guild activities:
                    </p>
                </div>
            </div>

            <div class="row">
                <div class="col-lg-8">
                    <table class="table">
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
                                    Mapping <span class="easy">Easy</span> difficulty
                                </td>
                                <td scope="row">
                                    5 (+2 if attached to quest)
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Mapping <span class="normal">Normal</span> difficulty
                                </td>
                                <td scope="row">
                                    6 (+2)
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Mapping <span class="hard">Hard</span> difficulty
                                </td>
                                <td scope="row">
                                    7 (+2)
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Mapping <span class="insane">Insane</span> difficulty
                                </td>
                                <td scope="row">
                                    8 (+2)
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Mapping <span class="expert">Expert</span> difficulty
                                </td>
                                <td scope="row">
                                    8 (+2)
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
                                    variable
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    Completing a quest
                                </td>
                                <td scope="row">
                                    variable
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    MBC Participation
                                </td>
                                <td scope="row">
                                    5
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    MBC Screening
                                </td>
                                <td scope="row">
                                    1
                                </td>
                            </tr>
                            <tr>
                                <td scope="row">
                                    MBC Voting
                                </td>
                                <td scope="row">
                                    1
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="col-lg-4 text-secondary">
                    <ul>
                        <li>Difficulty points scale according to a map's drain time, with the midpoint being around 2.5 minutes. Collaborative difficulties split points evenly between users.</li>
                        <li>All mapping-related points are rewarded upon a map reaching Ranked status. Storyboard points are subjectively determined by storyboard content (2, 7.5, or 10 points for minimalist, typical, and extraordinary content)</li>
                        <li>Contest points are earned through involvement with the <a href="https://osu.ppy.sh/help/wiki/Contests/Monthly_Beatmapping_Contest">Monthly Beatmapping Contest</a></li>
                    </ul>
                </div>
            </div>

            <div class="row align-items-center">
                <div class="col-md-9">
                    <h5>Promotion</h5>
                    <ul class="text-secondary">
                        <li>Maps created through the Mappers’ Guild will be used in medals and occasionally as promotional material.</li>
                        <li>Many quests will have their own themed medals, while other unrelated mapsets will be grouped under a general Mappers’ Guild medal. Special quests involving unannounced featured artists will additionally be used as promotional material in news posts when applicable.</li>
                        <li>Mappers' Guild mapsets that include difficulty spreads beginning from an Easy difficulty are eligible to be bundled in new installations of osu!.</li>
                    </ul>
                </div>
                <div class="col-md-2 text-center">
                    <img src="/images/medal.png" class="osu-badge">
                </div>
            </div>
        </div>

        <template v-if="!loggedInUser">
            <div class="radial-divisor" />

            <div class="container card card-body py-4">
                <div class="row">
                    <div class="col-12">
                        <h4>How do I join the Mappers' Guild?</h4>
                        <p class="text-secondary">
                            If you have 3 or more ranked maps, you can join the Mappers' Guild by clicking the button below and authenticating through your osu! login. If you don't meet the requirements, you can still view the pages, but you can't interact with them!
                        </p>
                        <p class="text-secondary">
                            Additionally, we recommend reading the <a href="/faq">frequently asked questions</a> page to better understand what you may be doing as a member of the Mappers' Guild.
                        </p>
                    </div>
                    <div class="col-12 text-center">
                        <a href="/login" class="btn btn-primary">Verify osu! account</a>
                    </div>
                </div>
            </div>
        </template>

        <div class="text-center" style="margin-bottom: 50px;">
            <img src="/images/mg-logo.png" style="width:171px; height: 150px; margin-top: 50px;">
        </div>

        <a
            href="https://bn.mappersguild.com/"
            class="btn btn-sm btn-primary"
            style="
                position: fixed;
                z-index: 1060;
                right: 20px;"
            :style="loggedInUser ? 'bottom: 80px;' : 'bottom: 20px;'"
        >
            visit BN/NAT site
        </a>
    </div>
</template>

<script lang="ts">
import { FeaturedArtist } from '@interfaces/featuredArtist';
import { defineComponent } from 'vue';
import { mapState } from 'vuex';

export default defineComponent({
    computed: {
        ...mapState([
            'loggedInUser',
            'homeArtists',
            'limit',
        ]),
    },
    async created () {
        const data = await this.$http.executeGet<{ artists: FeaturedArtist[] }>('/home/' + this.limit);

        if (!this.$http.isError(data)) {
            this.$store.commit('setHomeArtists', data.artists);
            this.$store.commit('setLimit', this.limit + 6);
        }
    },
    methods: {
        fallbackImg (e) {
            e.target.src = '/images/no-art-icon.png';
        },
        async showMore (e) {
            const data = await this.$http.executeGet<{ artists: FeaturedArtist[] }>('/home/' + this.limit);

            if (!this.$http.isError(data)) {
                this.$store.commit('setHomeArtists', data.artists);
                this.$store.commit('setLimit', this.limit + 6);
            }
        },
    },
});
</script>
