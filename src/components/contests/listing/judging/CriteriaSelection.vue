<template>
    <div>
        <div class="input-group w-75 mb-2">
            <input
                v-model="nameInput"
                type="text"
                class="form-control"
                placeholder="criteria name..."
            >
            <input
                v-model="maxScoreInput"
                type="number"
                class="form-control"
                placeholder="total points..."
            >
            <div class="input-group-append">
                <button
                    class="btn btn-primary"
                    href="#"
                    @click="addCriteria($event)"
                >
                    Add criteria <i class="fas fa-plus fa-xs" />
                </button>
            </div>
        </div>

        <table
            v-if="criterias.length"
            class="table table-sm table-responsive-lg"
        >
            <thead>
                <tr>
                    <th>Criteria</th>
                    <th>Max score</th>
                    <th>Delete</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="criteria in scoredCriteria"
                    :key="criteria.id"
                >
                    <td class="text-capitalize">
                        {{ criteria.name }}
                    </td>
                    <td>
                        {{ criteria.maxScore }}
                    </td>
                    <td>
                        <a
                            v-if="confirmDelete != criteria.id"
                            href="#"
                            class="text-danger"
                            @click.prevent="confirmDelete = criteria.id"
                        >
                            delete
                        </a>
                        <a
                            v-else
                            :class="processingDelete ? 'text-secondary disabled' : 'text-danger'"
                            href="#"
                            @click.prevent="deleteSubmission(criteria.id, $event)"
                        >
                            confirm
                        </a>
                    </td>
                </tr>
                <tr>
                    <td :class="commentsEnabled ? '' : 'text-secondary'">
                        Comments {{ commentsEnabled ? '' : '(disabled)' }}
                    </td>
                    <td :class="commentsEnabled ? '' : 'text-secondary'">
                        N/A
                    </td>
                    <td>
                        <a
                            href="#"
                            class="text-danger"
                            @click.prevent="toggleComments()"
                        >
                            {{ commentsEnabled ? 'disable' : 'enable' }}
                        </a>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Criteria } from '@interfaces/contest/criteria';

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
            processingDelete: false,
        };
    },
    computed: {
        scoredCriteria (): Criteria[] {
            return this.criterias.filter(c => c.name !== 'comments');
        },
        commentsEnabled (): boolean {
            return this.criterias.some(c => c.name == 'comments');
        },
    },
    methods: {
        async addCriteria(e): Promise<void> {
            const allCriterias = await this.$http.executePost<Criteria[]>(`/contests/listing/addCriteria`, { name: this.nameInput.toLowerCase(), maxScore: parseInt(this.maxScoreInput), contestId: this.contestId }, e);

            if (!this.$http.isError(allCriterias)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Added criteria`,
                    type: 'info',
                });
                this.allCriterias = allCriterias;
            }
        },
        async toggleComments(): Promise<void> {
            const criterias = await this.$http.executePost(`/contests/listing/${this.contestId}/toggleComments`, {});

            if (!this.$http.isError(criterias)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Toggled comments`,
                    type: 'info',
                });
                this.$store.commit('updateContestCriterias', {
                    contestId: this.contestId,
                    criterias,
                });
            }
        },
    },
});
</script>