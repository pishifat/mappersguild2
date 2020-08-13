<template>
    <div id="limitedEditParty" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
            <div v-if="party" class="modal-content bg-dark">
                <div class="modal-header modal-header-card text-dark" :class="'bg-rank-' + party.rank">
                    <h5 class="modal-title modal-title-card">
                        {{ party.name }}
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body modal-body-card" style="overflow: hidden;">
                    <img src="../../images/the_A.png" class="the-a-background">
                    <p>
                        Members: (<span :class="party.id + '-member-count'">{{ party.members.length }}</span>)
                    </p>
                    <p style="margin-left: 20px;">
                        <template v-for="(member, i) in party.members">
                            <a :key="i" :href="'https://osu.ppy.sh/users/' + member.osuId" target="_blank">
                                {{ listUser(member.username, i, party.members.length) }}
                            </a>
                        </template>
                    </p>
                    <p>
                        Leader: <a :href="'https://osu.ppy.sh/users/' + party.leader.osuId" target="_blank">{{ party.leader.username }}</a>
                    </p>
                    <p>
                        Rank: {{ party.rank }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'LimitedPartyInfo',
    props: {
        party: {
            type: Object,
            required: true,
        },
    },
});
</script>

<style>

</style>
