<template>
    <modal-dialog
        id="limitedEditParty"
        :header-class="party ? ('bg-rank-' + party.rank) : ''"
        :loaded="Boolean(party)"
    >
        <template #header>
            {{ party.name }}
        </template>

        <template #default>
            <p>
                Members: (<span :class="party.id + '-member-count'">{{ party.members.length }}</span>)
            </p>
            <p style="margin-left: 20px;">
                <a
                    v-for="(member, i) in party.members"
                    :key="i"
                    :href="'https://osu.ppy.sh/users/' + member.osuId"
                    target="_blank"
                >
                    {{ listUser(member.username, i, party.members.length) }}
                </a>
            </p>
            <p>
                Leader: <a :href="'https://osu.ppy.sh/users/' + party.leader.osuId" target="_blank">{{ party.leader.username }}</a>
            </p>
            <p>
                Rank: {{ party.rank }}
            </p>
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModalDialog from '@components/ModalDialog.vue';

export default defineComponent({
    name: 'LimitedPartyInfo',
    components: {
        ModalDialog,
    },
    props: {
        party: {
            type: Object,
            required: true,
        },
    },
});
</script>
