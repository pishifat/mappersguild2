<template>
    <modal-dialog
        id="limitedEditParty"
        :header-class="party ? ('bg-rank-' + party.rank) : ''"
        :loaded="Boolean(party)"
    >
        <template #header>
            {{ party.leader.username }}'s party
        </template>

        <template #default>
            <p>
                Members: (<span :class="party.id + '-member-count'">{{ party.members.length }}</span>)
            </p>
            <p>
                <user-link-list :users="party.members" />
            </p>
            <p>
                Leader:
                <user-link :user="party.leader" />
            </p>
            <p>
                Rank: {{ party.rank }}
            </p>
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import ModalDialog from '@components/ModalDialog.vue';
import UserLinkList from '@components/UserLinkList.vue';
import { Party } from '@interfaces/party';

export default defineComponent({
    name: 'LimitedPartyInfo',
    components: {
        ModalDialog,
        UserLinkList,
    },
    props: {
        party: {
            type: Object as PropType<Party>,
            required: true,
        },
    },
});
</script>
