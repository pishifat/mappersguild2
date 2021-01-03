<template>
    <div class="container card card-body pt-1 pb-4">
        <div class="row">
            <div class="col-md-12">
                <table class="table table-sm mt-3">
                    <thead>
                        <tr>
                            <th scope="col">
                                date
                            </th>
                            <th scope="col">
                                user
                            </th>
                            <th scope="col">
                                action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="log in logs"
                            :key="log.id"
                        >
                            <td scope="row">
                                {{ shortDate(log.createdAt) }}
                            </td>
                            <td scope="row">
                                {{ log.user.username }}
                            </td>
                            <td scope="row">
                                {{ shortAction(log.action) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="text-center">
                    <button
                        class="btn btn-sm btn-primary"
                        type="button"
                        @click="showMore($event)"
                    >
                        <i class="fas fa-angle-down me-1" /> show more <i class="fas fa-angle-down ms-1" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Log } from '@interfaces/log';
import { defineComponent } from 'vue';

interface LogsResponse {
    logs: Log[]
}

export default defineComponent({
    data () {
        return {
            skip: 100,
            logs: [] as Log[],
        };
    },
    async created () {
        const data = await this.$http.initialRequest<LogsResponse>(`/logs/query`);

        if (!this.$http.isError(data)) {
            this.logs = data.logs;
        }
    },
    methods: {
        shortDate (date): string {
            if (!date) return '';

            return new Date(date).toLocaleString('en-US', {
                timeZone: 'UTC',
                timeZoneName: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
        },
        shortAction (action) {
            if (!action) return '';
            if (action.length > 120) return action.toString().slice(0, 120) + '...';

            return action;
        },
        async showMore (e) {
            const data = await this.$http.executeGet<LogsResponse>(`/logs/query?skip=${this.skip}`, e);

            if (!this.$http.isError(data)) {
                this.skip += 100;
                this.logs = [...this.logs, ...data.logs];
            }
        },
    },
});
</script>
