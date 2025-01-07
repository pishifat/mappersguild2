<template>
    <div>
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
            <h4>Marketplace</h4>
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
