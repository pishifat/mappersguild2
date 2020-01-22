<template>
    <div>
        <div class="row mb-2">
            <div class="col">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <div class="input-group-text">
                            <i class="fas fa-search" />
                        </div>
                    </div>
                    <input
                        class="form-control"
                        type="text"
                        maxlength="48"
                        :placeholder="placeholder"
                        autocomplete="off"
                        :value="filterValue"
                        @key.enter="setFilterValue($event.target.value)"
                    >
                    <div v-if="placeholder != 'quest name...'" class="input-group-append">
                        <button
                            class="btn btn-outline-secondary"
                            type="button"
                            @click="selfFilter"
                        >
                            <i class="fas fa-user-circle" />
                        </button>
                    </div>
                    <div class="input-group-append">
                        <slot />
                    </div>
                </div>
            </div>
        </div>
        <div class="row small">
            <div class="col">
                <div class="row mt-3">
                    <div class="col-auto filter-title">
                        Mode
                    </div>
                    <div class="col">
                        <a
                            href="#"
                            class="mode"
                            :class="getSortClass('any')"
                            @click.prevent="setFilterMode('any')"
                        >
                            Any
                        </a>
                        <a
                            id="osu"
                            href="#"
                            class="mode"
                            :class="getSortClass('osu')"
                            @click.prevent="setFilterMode('osu')"
                        >
                            osu!
                        </a>
                        <a
                            id="taiko"
                            href="#"
                            class="mode"
                            :class="getSortClass('taiko')"
                            @click.prevent="setFilterMode('taiko')"
                        >
                            osu!taiko
                        </a>
                        <a
                            id="catch"
                            href="#"
                            class="mode"
                            :class="getSortClass('catch')"
                            @click.prevent="setFilterMode('catch')"
                        >
                            osu!catch
                        </a>
                        <a
                            id="mania"
                            href="#"
                            class="mode"
                            :class="getSortClass('mania')"
                            @click.prevent="setFilterMode('mania');"
                        >
                            osu!mania
                        </a>
                        <span v-if="isLoading" class="small text-white-50">loading...</span>
                    </div>
                </div>

                <div v-if="filterStatus !== undefined" class="row mt-3">
                    <div class="col-auto filter-title">
                        Status
                    </div>
                    <div class="col">
                        <a href="#" class="status sorted" @click.prevent="setFilterStatus('any')">Any</a>
                        <a href="#" class="status unsorted" @click.prevent="setFilterStatus('WIP')">WIP</a>
                        <a href="#" class="status unsorted" @click.prevent="setFilterStatus('Done')">Done</a>
                        <a href="#" class="status unsorted" @click.prevent="setFilterStatus('Qualified')">Qualified</a>
                        <a href="#" class="status unsorted" @click.prevent="setFilterStatus('Ranked')">Ranked</a>
                    </div>
                </div>

                <div v-if="filterQuest !== undefined" class="row mt-3">
                    <div class="col-auto filter-title">
                        Quest
                    </div>
                    <div class="col">
                        <a href="#" class="quest sorted" @click.prevent="setFilterQuest('any')">Any</a>
                        <a href="#" class="quest unsorted" @click.prevent="setFilterQuest('none')">None</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { FilterMode } from '../models/extras';
import { mapState, mapMutations } from 'vuex';

export default Vue.extend({
    props: {
        allQuests: Array,
        placeholder: String,
        isLoading: Boolean,
    },
    computed: mapState([
        'filterValue',
        'filterMode',
        'filterStatus',
        'filterQuest',
    ]),
    methods: {
        ...mapMutations([
            'setFilterValue',
            'setFilterMode',
            'setFilterStatus',
            'setFilterQuest',
        ]),
        getSortClass(mode: FilterMode): 'sorted' | 'unsorted' {
            if (this.filterMode === mode) {
                return 'sorted';
            }

            return 'unsorted';
        },
        selfFilter(): void {
            this.$store.commit('setFilterValue', this.$store.state.username);
        },
    },
});
</script>

<style>
.filter-title {
    width: 60px;
}
</style>
