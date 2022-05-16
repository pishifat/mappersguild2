<template>
    <div>
        <ul class="list-unstyled ms-4">
            <li v-for="criteria of allCriterias" :key="criteria.id">
                <a href="#" @click.prevent="toggleCriteria(criteria.id)">
                    <i class="fas" :class="criteriaIds.includes(criteria.id) ? 'text-done fa-check' : 'text-danger fa-times'" />
                </a>
                <span class="text-white-50 ms-1 text-capitalize">{{ criteria.name }} ({{ criteria.maxScore }})</span>
            </li>
        </ul>
        <p class="row">
            <input
                v-model="nameInput"
                class="form-control form-control-sm w-25 col-sm-2 me-2"
                type="text"
                autocomplete="off"
                placeholder="new criteria's name..."
            >
            <input
                v-model="maxScoreInput"
                class="form-control form-control-sm w-25 col-sm-2 me-2"
                type="text"
                autocomplete="off"
                placeholder="new criteria's max score..."
            >
            <button
                type="button"
                class="btn btn-sm btn-outline-info col-sm-2 me-2"
                @click="addCriteria($event)"
            >
                Add criteria
            </button>
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Criteria } from '../../../../interfaces/contest/criteria';

export default defineComponent({
    name: 'CriteriaSelection',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        criterias: {
            type: Array as PropType<Criteria[]>,
            required: true,
        },
    },
    data () {
        return {
            allCriterias: [] as Criteria[],
            nameInput: '',
            maxScoreInput: '',
        };
    },
    computed: {
        criteriaIds (): string[] {
            return this.criterias.map(c => c.id);
        },
    },
    async created (): Promise<void> {
        await this.loadAllCriterias();
    },
    methods: {
        async loadAllCriterias (): Promise<void> {
            const data = await this.$http.executeGet<{ criterias: Criteria[] }>(`/admin/contests/criterias/`);

            if (!this.$http.isError(data)) {
                this.allCriterias = data.criterias;
            }
        },
        async toggleCriteria(id: string): Promise<void> {
            const criterias = await this.$http.executePost(`/admin/contests/${this.contestId}/toggleCriteria`, { criteriaId: id });

            if (!this.$http.isError(criterias)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `toggled criteria`,
                    type: 'info',
                });
                this.$store.commit('updateContestCriterias', {
                    contestId: this.contestId,
                    criterias,
                });
            }
        },
        async addCriteria(e): Promise<void> {
            const allCriterias = await this.$http.executePost<Criteria[]>(`/admin/contests/addCriteria`, { name: this.nameInput.toLowerCase(), maxScore: parseInt(this.maxScoreInput) }, e);

            if (!this.$http.isError(allCriterias)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `added criteria`,
                    type: 'info',
                });
                this.allCriterias = allCriterias;
            }
        },
    },
});
</script>