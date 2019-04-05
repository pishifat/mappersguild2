<template>
    <div class="row">
        <div class="col-md-12">
            <div class="mb-3">
                <small
                    >Search:
                    <input
                        id="search"
                        class="text-input text-input ml-1"
                        v-model="filterValue"
                        type="text"
                        placeholder="beatmap..."
                    />
                </small>
                <small class="ml-1">
                    <select class="custom-select inline-custom-select" id="mode" v-model="filterMode">
                        <option class="ml-2" value="" selected>All modes</option>
                        <option class="ml-2" value="osu">osu!</option>
                        <option class="ml-2" value="taiko">osu!taiko</option>
                        <option class="ml-2" value="catch">osu!catch</option>
                        <option class="ml-2" value="mania">osu!mania</option>
                    </select>
                </small>
                <button class="btn btn-sm btn-qat ml-1" data-toggle="modal" data-target="#addVeto">
                    Submit veto
                </button>
            </div>

            <button
                :disabled="!(pre > 0)"
                class="btn btn-sm btn-qat mx-auto my-2"
                style="display:block"
                type="button"
                @click="showNewer()"
            >
                <i class="fas fa-angle-up mr-1"></i> show next <i class="fas fa-angle-up ml-1"></i>
            </button>
            <transition-group name="list" tag="div" class="row">
                <veto-card
                    v-for="veto in vetoes"
                    :key="veto.id"
                    :veto="veto"
                    :userId="userId"
                    :userGroup="userGroup"
                    :filterMode="filterMode"
                    @update:selectedVeto="selectedVeto = $event"
                ></veto-card>
            </transition-group>
            <div class="small text-center mx-auto">{{ currentPage }} of {{ pages }}</div>
            <button
                :disabled="!canShowOlder"
                class="btn btn-sm btn-qat mx-auto my-2"
                style="display:block"
                type="button"
                @click="showOlder()"
            >
                <i class="fas fa-angle-down mr-1"></i> show previous <i class="fas fa-angle-down ml-1"></i>
            </button>
        </div>
        <veto-info
            :veto="selectedVeto"
            :user-id="userId"
            :user-group="userGroup"
            :.sync="selectedVeto"
            :vetoes.sync="vetoes"
            @update-veto="updateVeto($event)"
        ></veto-info>
        <submit-veto @submit-veto="SubmitVeto($event)"></submit-veto>
    </div>
</template>

<script>
import VetoCard from '../components/vetoes/VetoCard.vue';
import VetoInfo from '../components/vetoes/VetoInfo.vue';
import SubmitVeto from '../components/vetoes/SubmitVeto.vue';

export default {
    name: 'vetoes-page',
    components: {
        VetoCard,
        VetoInfo,
        SubmitVeto,
    },
    watch: {
        filterValue: function(v) {
            this.filter();
        },
        filterMode: function(v) {
            this.filter();
        },
        limit: function() {
            this.limit = Math.round(this.limit);
            this.pre = this.limit - 16;
            if (this.allVetoes) {
                if (this.isFiltered) {
                    if (this.limit >= this.filteredVetoes.length) {
                        this.canShowOlder = false;
                    }
                    this.vetoes = this.filteredVetoes.slice(this.pre, this.limit);
                    this.pages = Math.ceil(this.filteredVetoes.length / 16);
                } else {
                    if (this.limit >= this.allVetoes.length) {
                        this.canShowOlder = false;
                    }
                    this.vetoes = this.allVetoes.slice(this.pre, this.limit);
                    this.pages = Math.ceil(this.allVetoes.length / 16);
                }
            }
            if (this.pages > 0) {
                this.currentPage = this.limit / 16;
            } else {
                this.currentPage = this.pages;
            }
        },
    },
    methods: {
        showOlder: function() {
            if (this.canShowOlder) {
                this.limit += 16;
            }
        },
        showNewer: function() {
            if (this.pre > 0) {
                this.limit -= 16;
                this.canShowOlder = true;
            }
        },
        SubmitVeto: function(v) {
            this.allVetoes.push(v);
        },
        updateVeto: function(v) {
            const i = this.allVetoes.findIndex(veto => veto.id == v.id);
            this.allVetoes[i] = v;

            i = this.vetoes.findIndex(veto => veto.id == v.id);
            this.vetoes[i] = v;

            this.selectedVeto = v;
        },
        filter: function() {
            this.vetoes = this.allVetoes;

            //mode
            if (this.filterMode.length) {
                this.filteredVetoes = this.allVetoes.filter(v => {
                    if (this.filterMode == 'osu' && v.modes.indexOf('osu') !== -1) {
                        return true;
                    }
                    if (this.filterMode == 'taiko' && v.modes.indexOf('taiko') !== -1) {
                        return true;
                    }
                    if (this.filterMode == 'catch' && v.modes.indexOf('catch') !== -1) {
                        return true;
                    }
                    if (this.filterMode == 'mania' && v.modes.indexOf('mania') !== -1) {
                        return true;
                    }
                    return false;
                });
            }

            //search
            if (this.filterValue.length > 2) {
                if (this.filterMode.length) {
                    this.filteredVetoes = this.allVetoes.filter(v => {
                        //something with bm
                        // if (v.beatmap.toLowerCase().indexOf(this.filterValue.toLowerCase()) > -1) {
                        //     return true;
                        // }
                        return false;
                    });
                } else {
                    this.filteredVetoes = this.allVetoes.filter(v => {
                        //something with bm
                        // if (v.beatmap.toLowerCase().indexOf(this.filterValue.toLowerCase()) > -1) {
                        //     return true;
                        // }
                        return false;
                    });
                }
            }

            this.isFiltered = this.filterValue.length > 2 || this.filterMode.length;
            if (this.sortBy) {
                this.sort(this.sortBy, true);
            }
            this.limit = 16.01; //resets to first page
            this.canShowOlder = true;
        },
    },
    data() {
        return {
            vetoes: null,
            allVetoes: null,
            filteredVetoes: null,
            userId: null,
            userGroup: null,
            filterValue: '',
            filterMode: '',
            isFiltered: false,
            selectedVeto: null,
            sortBy: null,
            asc: false,
            canShowOlder: true,
            pre: null,
            limit: null,
            pages: null,
            currentPage: null,
        };
    },
    created() {
        axios
            .get('/qat/vetoes/relevantInfo')
            .then(response => {
                this.allVetoes = response.data.vetoes;
                this.userId = response.data.userId;
                this.userGroup = response.data.userGroup;
                this.limit = 16;
            })
            .then(function() {
                $('#loading').fadeOut();
                $('.container')
                    .attr('style', 'visibility: visible')
                    .hide()
                    .fadeIn();
            });
    },
    mounted() {
        setInterval(() => {
            axios.get('/users/relevantInfo').then(response => {
                this.allVetoes = response.data.vetoes;
                if (this.isFiltered) {
                    this.filter();
                }
            });
        }, 300000);
    },
};
</script>

<style>
</style>
