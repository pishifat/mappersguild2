<template>
    <div>
        <h5>Announcements</h5>
        <div class="ms-2 mb-2">
            <a href="#uploadAnnouncement" data-bs-toggle="collapse" @click.prevent>
                See upload beatmaps announcement
                <i class="fas fa-angle-down" />
            </a>
            <div id="uploadAnnouncement" class="collapse">
                <textarea
                    v-model="uploadBeatmapText"
                    length="4"
                    class="ml-1 form-control"
                    maxlength="40000"
                    rows="6"
                />
                <button class="btn btn-sm w-100 btn-primary mt-2" @click="sendAnnouncement($event)">
                    Send announcement
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Contest } from '@interfaces/contest/contest';

export default defineComponent({
    name: 'ContestAnnouncements',
    props: {
        contest: {
            type: Object as () => Contest,
            required: true,
        },
    },
    data () {
        return {
            uploadBeatmapText: `hello! results for [${this.contest.name}](${this.contest.url}) are finalized, so you can upload your map!\n\nthe winners will be linked in the results news post, and the top submissions will be part of [Featured Artist playlists](https://osu.ppy.sh/wiki/en/People/Featured_Artists/Featured_Artist_playlists) for two weeks.\n- if you want your map in the playlist, **do not update your map after the results are released** (until the playlist is finished)\n- if you *don't* want your map in the playlist, let me know in advance.\n\nthats all :)`,
        };
    },
    methods: {
        async sendAnnouncement(e): Promise<void> {
            const result = confirm(`Are you sure?`);

            if (result) {
                const announcement = await this.$http.executePost(`/contests/listing/${this.contest.id}/sendAnnouncement`, { text: this.uploadBeatmapText }, e);

                if (!this.$http.isError(announcement)) {
                    this.$store.dispatch('updateToastMessages', {
                        message: `Announcement sent`,
                        type: 'info',
                    });
                }
            }
        },
    },
});
</script>