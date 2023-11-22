<template>
    <modal-dialog id="newsPost" title="Generate news post">
        <p>
            <button class="btn btn-sm btn-outline-info" @click="loadNewsInfo($event)">
                Load user info
            </button>
            <input
                v-model="date"
                class="form-control form-control-sm mx-2 w-25"
                type="text"
                autocomplete="off"
                placeholder="YYYY-MM-DD"
            />
        </p>

        <p v-if="users">
            Users with ranked maps/tasks:
        </p>

        <copy-paste v-if="users" :distinct="'users'">
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
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CopyPaste from '../../CopyPaste.vue';
import ModalDialog from '@components/ModalDialog.vue';

export default defineComponent({
    name: 'NewsPost',
    components: {
        CopyPaste,
        ModalDialog,
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