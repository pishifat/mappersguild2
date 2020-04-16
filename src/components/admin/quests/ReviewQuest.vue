<template>
    <div id="reviewQuest" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
            <div v-if="quest" class="modal-content bg-dark">
                <div class="modal-header text-dark bg-rest">
                    <h5 class="modal-title">
                        {{ quest.name }} by
                        <a :href="'https://osu.ppy.sh/users/' + quest.creator.osuId" class="text-dark" target="_blank">
                            {{ quest.creator.username }}
                        </a>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden">
                    <div class="container text-shadow">
                        <p class="small text-white-50 min-spacing">
                            Artist
                        </p>
                        <p v-if="quest.art" class="ml-2">
                            <a :href="'https://osu.ppy.sh/beatmaps/artists/' + quest.art" target="_blank">
                                <img :src="'https://assets.ppy.sh/artists/' + quest.art + '/cover.jpg'" class="card-avatar-img">
                            </a>
                        </p>
                        <p v-else class="ml-2">
                            None
                        </p>
                        <p class="small text-white-50 min-spacing">
                            Name
                        </p>
                        <p class="ml-2">
                            {{ quest.name }}
                        </p>
                        <p class="small text-white-50 min-spacing">
                            Objective
                        </p>
                        <p class="ml-2">
                            {{ quest.descriptionMain }}
                        </p>
                        <p class="small text-white-50 min-spacing">
                            Required mapsets
                        </p>
                        <p class="ml-2">
                            {{ quest.requiredMapsets }}
                        </p>
                        <p class="small text-white-50 min-spacing">
                            Price
                        </p>
                        <p class="ml-2">
                            {{ quest.price }} points per user
                        </p>
                        <p class="small text-white-50 min-spacing">
                            Timeframe
                        </p>
                        <p class="ml-2">
                            {{ quest.timeframe / (24*3600*1000) }} days
                        </p>
                        <p class="small text-white-50 min-spacing">
                            Party size
                        </p>
                        <p class="ml-2">
                            {{ quest.minParty }}-{{ quest.maxParty }} members
                        </p>
                        <p class="small text-white-50 min-spacing">
                            Party rank
                        </p>
                        <p class="ml-2">
                            {{ quest.minRank }} rank required
                        </p>

                        <div class="radial-divisor mx-auto my-3" />

                        <button type="submit" class="btn btn-outline-success btn-block" @click="acceptPendingQuest($event)">
                            Publish quest
                        </button>
                        <button type="submit" class="btn btn-outline-danger btn-block" @click="rejectPendingQuest($event)">
                            Reject quest
                        </button>
                        <button class="btn btn-outline-secondary btn-block" data-toggle="collapse" data-target="#forumPm">
                            See rejection message <i class="fas fa-angle-down" />
                        </button>
                        <div id="forumPm" class="collapse">
                            <div class="copy-paste small text-white-50">
                                <samp>hello, you're receiving this message because you submitted a Mappers' Guild quest for review</samp><br><br>
                                <samp>your quest has been rejected for the following reason(s):</samp><br><br>
                                <samp>[notice]   [/notice]</samp><br><br>
                                <samp>points spent for submitting the quest have been returned to your "available points" pool. if you'd like to modify the quest according to above feedback, you can resubmit it and i'll review it again! or if you'd like to submit any other quest, that's fine too!</samp><br><br>
                                <samp>thanks for being cool</samp><br><br>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Quest } from '../../../../interfaces/quest';

export default Vue.extend({
    name: 'ReviewQuest',
    props: {
        quest: {
            type: Object as () => Quest,
            default: null,
        },
    },
    methods: {
        async acceptPendingQuest(e): Promise<void> {
            const quest = await this.executePost(`/admin/quests/${this.quest.id}/publish`, {}, e);

            if (!this.isError(quest)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `published quest`,
                    type: 'info',
                });
                this.$store.commit('updateQuest', quest);
                $('#reviewQuest').modal('hide');
            }
        },
        async rejectPendingQuest(e): Promise<void> {
            const quest = await this.executePost(`/admin/quests/${this.quest.id}/reject`, {}, e);

            if (!this.isError(quest)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `rejected quest`,
                    type: 'info',
                });
                this.$store.commit('updateQuest', quest);
                $('#reviewQuest').modal('hide');
            }
        },
    },
});
</script>

<style>

.card-avatar-img {
    max-width: 36px;
    max-height: 36px;
    object-fit: cover;
    border-radius: 100%;
    box-shadow: 0 1px 0.5rem rgba(10, 10, 25);
    background-color: rgba(10, 10, 25);
}

</style>