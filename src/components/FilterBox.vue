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
                        @keyup.enter="updateFilterValue($event.target.value)"
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
                            :class="getModeSortClass('any')"
                            @click.prevent="updateFilterMode('any')"
                        >
                            Any
                        </a>
                        <a
                            id="osu"
                            href="#"
                            class="mode"
                            :class="getModeSortClass('osu')"
                            @click.prevent="updateFilterMode('osu')"
                        >
                            osu!
                        </a>
                        <a
                            id="taiko"
                            href="#"
                            class="mode"
                            :class="getModeSortClass('taiko')"
                            @click.prevent="updateFilterMode('taiko')"
                        >
                            osu!taiko
                        </a>
                        <a
                            id="catch"
                            href="#"
                            class="mode"
                            :class="getModeSortClass('catch')"
                            @click.prevent="updateFilterMode('catch')"
                        >
                            osu!catch
                        </a>
                        <a
                            id="mania"
                            href="#"
                            class="mode"
                            :class="getModeSortClass('mania')"
                            @click.prevent="updateFilterMode('mania');"
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
                        <a
                            href="#"
                            class="status"
                            :class="getStatusSortClass('any')"
                            @click.prevent="updateFilterStatus('any')"
                        >
                            Any
                        </a>
                        <a
                            href="#"
                            class="status"
                            :class="getStatusSortClass('WIP')"
                            @click.prevent="updateFilterStatus('WIP')"
                        >
                            WIP
                        </a>
                        <a
                            href="#"
                            class="status"
                            :class="getStatusSortClass('Done')"
                            @click.prevent="updateFilterStatus('Done')"
                        >
                            Done
                        </a>
                        <a
                            href="#"
                            class="status"
                            :class="getStatusSortClass('Qualified')"
                            @click.prevent="updateFilterStatus('Qualified')"
                        >
                            Qualified
                        </a>
                        <a
                            href="#"
                            class="status"
                            :class="getStatusSortClass('Ranked')"
                            @click.prevent="updateFilterStatus('Ranked')"
                        >
                            Ranked
                        </a>
                    </div>
                </div>

                <div v-if="filterQuest !== undefined" class="row mt-3">
                    <div class="col-auto filter-title">
                        Quest
                    </div>
                    <div class="col">
                        <a
                            href="#"
                            class="quest"
                            :class="getQuestSortClass('any')"
                            @click.prevent="updateFilterQuest('any')"
                        >
                            Any
                        </a>
                        <a
                            href="#"
                            class="quest"
                            :class="getQuestSortClass('none')"
                            @click.prevent="updateFilterQuest('none')"
                        >
                            None
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapMutations, mapActions } from 'vuex';

export default Vue.extend({
    props: {
        allQuests: Array,
        placeholder: {
            type: String,
            required: true,
        },
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
        ...mapActions([
            'updateFilterValue',
            'updateFilterMode',
            'updateFilterStatus',
            'updateFilterQuest',
        ]),
        getModeSortClass(mode: string): 'sorted' | 'unsorted' {
            if (this.filterMode === mode) {
                return 'sorted';
            }

            return 'unsorted';
        },
        getStatusSortClass(status: string): 'sorted' | 'unsorted' {
            if (this.filterStatus === status) {
                return 'sorted';
            }

            return 'unsorted';
        },
        getQuestSortClass(quest: 'any' | 'none'): 'sorted' | 'unsorted' {
            if (this.filterQuest === quest) {
                return 'sorted';
            }

            return 'unsorted';
        },
        selfFilter(): void {
            this.updateFilterValue(this.$store.state.username);
        },
    },
});
</script>

<style>
.filter-title {
    width: 60px;
}
</style>
