<template>
    <div class="container card card-body py-2 mt-2">
        <h5>Mappers' Guild contributor stats</h5>
        <div class="form-inline">
            <div class="form-group">
                <button class="btn btn-sm btn-info" @click="loadNewsInfo($event)">
                    Generate Mappers' Guild contributors stats
                </button>
                <input
                    v-model="date"
                    class="form-control form-control-sm d-inline mx-2 w-25"
                    type="text"
                    autocomplete="off"
                    placeholder="YYYY-MM-DD"
                />
            </div>
        </div>

        <div v-if="users && users.length">
            <p>
                Users with ranked maps/tasks:
            </p>

            <copy-paste :distinct="'users'">
                <div>
                    | User | Modes | Ranked beatmaps | Ranked difficulties |
                </div>
                <div>
                    | :-- | :-- | :-- | :-- |
                </div>
                <div v-for="user in users" :key="user.id">
                    | {{ user.flag }} [{{ user.username }}]({{ 'https://osu.ppy.sh/users/' + user.osuId }}) | <span v-for="(mode, i) in user.modes" :key="mode">{{ mode == 'osu' ? 'osu!' : mode == 'sb' ? 'Storyboarder' : mode == 'hs' ? 'Hitsounder' : 'osu!' + mode }}{{ separateCommas(i, user.modes.length) }}</span> | {{ user.hostCount }} | {{ user.taskCount }} |
                </div>
            </copy-paste>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CopyPaste from '@components/CopyPaste.vue';

export default defineComponent({
    name: 'ContributorStats',
    components: {
        CopyPaste,
    },
    data() {
        return {
            date: '2022-07-24',
            externalBeatmaps: [] as any,
            users: [] as any,
        };
    },
    methods: {
        async loadNewsInfo(e): Promise<void> {
            const res: any = await this.$http.executeGet('/admin/beatmaps/loadNewsInfo/' + this.date, e);

            if (res) {
                this.users = res.users;
            }
        },
        separateCommas(i, length): string {
            if (i < length - 1) {
                return ', ';
            } else {
                return '';
            }
        },
    },
});
</script>