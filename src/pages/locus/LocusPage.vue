<template>
    <div>
        <div class="container card card-body py-4 my-4">
            <h4>Welcome to Locus!</h4>
            <div>
                Derived from Latin, a <b>locus</b> can be described as "a particular place or position where something of interest occurs". Locus was conceived as an event that would bring the creative circles in osu! closer together. Beyond simply being a contest, Locus aims to foster positive relationships and champion the communities that shape the very foundation of osu!.
            </div>
            <div class="mt-2">
                Read the <a href="LINK" target="_blank">news post</a> for an introduction to the contest, and the <a href="LINK" target="_blank">wiki article</a> for the nitty gritty details.
            </div>
            <div class="mt-2">
                To discuss anything about Locus, check out the <code>#locus</code> channel in the <a href="https://discord.gg/ppy" target="_blank">osu! Discord server</a>.
            </div>
            <hr />
            <h5>What is the Nexus?</h5>
            <div>
                We cannot expect every composer and graphic designer who is interested in participating to be familiar with navigating the osu! community, so the <b>Nexus</b> was created as a support system to help those who are looking to form or join viable teams.
            </div>
            <ul class="mt-2">
                <li>
                    Potential participants who are looking to form a team may browse the Nexus to contact someone who they feel is suitable.
                </li>
                <li>
                    Once a team has been registered, the team member’s bios will be removed from the Nexus.
                </li>
            </ul>
        </div>
        <locus-page-filters />
        <div class="container card card-body mb-2">
        <h5 class="mt-2">
                <a
                    data-bs-toggle="collapse"
                    :href="`#selfDetails`"
                >
                    Your details
                    <i class="fas fa-angle-down" />
                </a>
            </h5>
            <self-locus-info
                id="selfDetails"
                class="collapse"
            />
        </div>
        <div class="radial-divisor" />
        <div class="container card card-body">
            <h4>Potential team members</h4>
            <div class="row">
                    <locus-card
                        v-for="locusInfo in filteredLocusInfos"
                        :key="locusInfo.id"
                        :locus-info="locusInfo"
                        class="col-sm-6"
                    />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import locusModule from '@store/locus';
import { LocusInfo } from '@interfaces/locusInfo';
import LocusPageFilters from './LocusPageFilters.vue';
import SelfLocusInfo from '@components/locus/SelfLocusInfo.vue';
import LocusCard from '@components/locus/LocusCard.vue';

export default defineComponent({
    name: 'LocusPage',
    components: {
        LocusPageFilters,
        SelfLocusInfo,
        LocusCard,
    },
    data () {
        return {
            userInput: null,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapState('locus', [
            'selfLocusInfo',
        ]),
        ...mapGetters('locus', [
            'filteredLocusInfos',
        ]),
    },
    beforeCreate () {
        if (!this.$store.hasModule('locus')) {
            this.$store.registerModule('locus', locusModule);
        }
    },
    async created () {
        const res = await this.$http.initialRequest<{ locusInfos: LocusInfo[], selfLocusInfo: LocusInfo }>('/locus/query');

        if (!this.$http.isError(res)) {
            this.$store.commit('locus/setLocusInfos', res.locusInfos);
            this.$store.commit('locus/setSelfLocusInfo', res.selfLocusInfo);
        }
    },
    methods: {
    },
});
</script>
